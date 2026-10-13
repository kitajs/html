import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import type { FileSystemCallbacks } from 'typescript/fs'
import type { API, ParsedCommandLine } from 'typescript/sync'
import type { AnalyzerContext } from './analyzer/context.js'
import { diagnoseSourceFile } from './analyzer/walk.js'
import {
  normalizeDiagnostics,
  type CheckResult,
  type KitaDiagnostic
} from './diagnostic.js'
import { normalizePath } from './paths.js'
import { loadTypeScript, type TypeScript } from './typescript.js'

/** A usage or configuration failure. The CLI prints the message and exits 1. */
export class CheckError extends Error {}

export interface CheckOptions {
  /** Base directory for relative project and file paths. */
  cwd: string
  /** Tsconfig files or directories, as passed with `-p`. Defaults to `cwd`. */
  projects?: readonly string[] | undefined
  /** Restricts reported diagnostics to these files. */
  files?: readonly string[] | undefined
  /** Receives non-fatal notices, such as skipped files. */
  onNotice?: ((message: string) => void) | undefined
  /** Host filesystem override, used by tests to serve in-memory projects. */
  fs?: FileSystemCallbacks | undefined
  /** Preloaded TypeScript modules, used by tests to share one load across cases. */
  typescript?: TypeScript | undefined
}

interface ResolvedProject {
  configPath: string
  parsed: ParsedCommandLine
}

const JSX_FILE = /\.(t|j)sx$/

function resolveEntries(options: Pick<CheckOptions, 'cwd' | 'projects' | 'fs'>) {
  return (options.projects?.length ? options.projects : ['.']).map((project) =>
    resolveConfigPath(path.resolve(options.cwd, project), options.fs)
  )
}

/**
 * Loads TypeScript from the first project's directory, the same one {@link check} uses
 * when no `typescript` option is given.
 */
export function loadProjectTypeScript(
  options: Pick<CheckOptions, 'cwd' | 'projects' | 'fs'>
): Promise<TypeScript> {
  return loadTypeScript(path.dirname(resolveEntries(options)[0]!))
}

export async function check(options: CheckOptions): Promise<CheckResult> {
  const notice = options.onNotice ?? (() => {})
  const entries = resolveEntries(options)

  const ts = options.typescript ?? (await loadTypeScript(path.dirname(entries[0]!)))
  const api = new ts.sync.API({ cwd: options.cwd, ...(options.fs && { fs: options.fs }) })

  try {
    return run(ts, api, entries, options, notice)
  } finally {
    api.close()
  }
}

function run(
  ts: TypeScript,
  api: API,
  entries: string[],
  options: CheckOptions,
  notice: (message: string) => void
): CheckResult {
  const key = (fileName: string) => api.getCanonicalFileName(normalizePath(fileName))
  const projects = expandProjects(ts, api, entries, key, options.fs)

  // Positional files narrow the report; the program still comes from the tsconfig
  let requested: Map<string, string> | undefined

  if (options.files?.length) {
    requested = new Map()

    for (const file of options.files) {
      if (!JSX_FILE.test(file)) {
        notice(`Skipping '${file}': not a TSX/JSX file.`)
        continue
      }

      requested.set(key(path.resolve(options.cwd, file)), file)
    }
  }

  const matched = new Set<string>()
  const checkedFiles = new Set<string>()
  const diagnostics: KitaDiagnostic[] = []
  const sources = new Map<string, string>()
  let hasJsxFiles = false

  for (const { configPath, parsed } of projects) {
    const targets = parsed.fileNames.filter((fileName) => {
      if (!JSX_FILE.test(fileName)) {
        return false
      }

      hasJsxFiles = true

      if (!requested) {
        return true
      }

      const fileKey = key(fileName)

      if (!requested.has(fileKey)) {
        return false
      }

      matched.add(fileKey)
      return true
    })

    if (!targets.length) {
      continue
    }

    const program = api.createProgram(parsed.fileNames, parsed.options, {
      projectReferences: parsed.projectReferences
    })

    try {
      const project = program.getProject()
      const kitaRoot = resolveKitaRoot(path.dirname(configPath))

      if (!kitaRoot) {
        notice(
          `Could not resolve @kitajs/html from ${path.dirname(configPath)}. ` +
            'Install it so Html.Children and JSX.Element types are recognized.'
        )
      }

      for (const fileName of targets) {
        const sourceFile = program.getSourceFile(fileName)

        if (!sourceFile) {
          continue
        }

        checkedFiles.add(key(fileName))

        const ctx: AnalyzerContext = {
          ts,
          checker: project.checker,
          project,
          sourceFile,
          kitaRoot,
          diagnostics: [],
          aliasCache: new Map()
        }

        const found = diagnoseSourceFile(ctx)

        if (found.length) {
          diagnostics.push(...found)
          sources.set(sourceFile.fileName, sourceFile.text)
        }
      }
    } finally {
      program.dispose()
    }
  }

  if (requested) {
    for (const [fileKey, file] of requested) {
      if (!matched.has(fileKey)) {
        notice(`Skipping '${file}': not part of any checked project.`)
      }
    }
  } else if (!hasJsxFiles) {
    throw new CheckError(
      `No TSX/JSX files found in ${projects.map((p) => p.configPath).join(', ')}.`
    )
  }

  return {
    typescriptVersion: ts.version,
    projects: projects.map((project) => project.configPath),
    filesChecked: checkedFiles.size,
    diagnostics: normalizeDiagnostics(diagnostics),
    sources
  }
}

/**
 * Parses each entry project. A solution-style config (no files of its own, only
 * references) is expanded through its references transitively, like `tsc -b`. A config
 * with files is checked alone, like `tsc -p`.
 */
function expandProjects(
  ts: TypeScript,
  api: API,
  entries: string[],
  key: (fileName: string) => string,
  host: FileSystemCallbacks | undefined
): ResolvedProject[] {
  const visited = new Set<string>()
  const projects: ResolvedProject[] = []

  for (const entry of entries) {
    const parsed = parseConfig(ts, api, entry)
    const isSolution = !parsed.fileNames.length && !!parsed.projectReferences?.length

    if (!isSolution) {
      if (!visited.has(key(entry))) {
        visited.add(key(entry))
        projects.push({ configPath: entry, parsed })
      }

      continue
    }

    const queue: ResolvedProject[] = [{ configPath: entry, parsed }]
    let found = 0

    while (queue.length) {
      const current = queue.shift()!

      for (const reference of current.parsed.projectReferences ?? []) {
        const configPath = resolveReferencePath(reference.path, current.configPath, host)

        if (visited.has(key(configPath))) {
          continue
        }

        visited.add(key(configPath))

        const referenced = { configPath, parsed: parseConfig(ts, api, configPath) }

        if (referenced.parsed.fileNames.length) {
          projects.push(referenced)
          found++
        }

        queue.push(referenced)
      }
    }

    if (!found) {
      throw new CheckError(`${entry} references no projects with files.`)
    }
  }

  return projects
}

function parseConfig(ts: TypeScript, api: API, configPath: string): ParsedCommandLine {
  const parsed = api.parseConfigFile(configPath)

  if (parsed.errors.length) {
    throw new CheckError(ts.sync.formatDiagnostics(parsed.errors, api).trimEnd())
  }

  return parsed
}

/** Resolves a `-p` value to a config file, accepting directories like `tsc -p`. */
function resolveConfigPath(
  target: string,
  host: FileSystemCallbacks | undefined
): string {
  if (isFile(target, host)) {
    return target
  }

  const inDirectory = path.join(target, 'tsconfig.json')

  if (isFile(inDirectory, host)) {
    return inDirectory
  }

  throw new CheckError(`Could not find a tsconfig.json at ${target}.`)
}

function resolveReferencePath(
  reference: string,
  from: string,
  host: FileSystemCallbacks | undefined
): string {
  try {
    return resolveConfigPath(reference, host)
  } catch {
    throw new CheckError(`Project ${reference} referenced by ${from} was not found.`)
  }
}

function isFile(target: string, host: FileSystemCallbacks | undefined): boolean {
  // In-memory test projects answer through the API filesystem callbacks
  if (host && typeof host.fileExists === 'function') {
    const answer = host.fileExists(normalizePath(target) as never)

    if (typeof answer === 'boolean') {
      return answer
    }
  }

  try {
    return fs.statSync(target).isFile()
  } catch {
    return false
  }
}

/**
 * Real path of the `@kitajs/html` package the project resolves, normalized for
 * comparison.
 */
function resolveKitaRoot(fromDirectory: string): string | undefined {
  try {
    const require = createRequire(path.join(fromDirectory, 'noop.js'))
    const packageJson = require.resolve('@kitajs/html/package.json')
    return normalizePath(fs.realpathSync(path.dirname(packageJson)))
  } catch {
    return undefined
  }
}
