import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * The TypeScript 7.1+ API modules used by the CLI. Every runtime import from
 * `typescript/*` goes through {@link loadTypeScript}, so API changes before 7.1 stable
 * stay in this file.
 */
export interface TypeScript {
  version: string
  sync: typeof import('typescript/sync')
  ast: typeof import('typescript/ast')
  is: typeof import('typescript/ast/is')
}

export type {
  Checker,
  Program,
  Project,
  Symbol,
  Diagnostic as TsDiagnostic,
  Type
} from 'typescript/sync'

export type * as Ast from 'typescript/ast'

export class TypeScriptVersionError extends Error {}

const MIN_MAJOR = 7
const MIN_MINOR = 1

/** True for TypeScript versions that ship the `typescript/sync` API, prereleases included. */
export function supportsSyncApi(version: string): boolean {
  const match = /^(\d+)\.(\d+)\./.exec(version)

  if (!match) {
    return false
  }

  const major = Number(match[1])
  const minor = Number(match[2])

  return major > MIN_MAJOR || (major === MIN_MAJOR && minor >= MIN_MINOR)
}

/**
 * Loads TypeScript from the checked project first, so the API client and its native
 * server match the version the project compiles with. Falls back to the copy next to the
 * CLI.
 */
export async function loadTypeScript(fromDirectory: string): Promise<TypeScript> {
  const require = resolveTypeScriptRequire(fromDirectory)

  const packageJsonPath = require.resolve('typescript/package.json')
  const { version } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
    version: string
  }

  if (!supportsSyncApi(version)) {
    throw new TypeScriptVersionError(
      `kita-html check requires typescript >=7.1 (found ${version} at ${path.dirname(packageJsonPath)}).\n` +
        'For TypeScript 5 or 6, use xss-scan from @kitajs/ts-html-plugin.'
    )
  }

  const load = (specifier: string) =>
    import(pathToFileURL(require.resolve(specifier)).href)

  const [sync, ast, is] = await Promise.all([
    load('typescript/sync'),
    load('typescript/ast'),
    load('typescript/ast/is')
  ])

  return { version, sync, ast, is }
}

function resolveTypeScriptRequire(fromDirectory: string) {
  const projectRequire = createRequire(path.join(fromDirectory, 'noop.js'))

  try {
    projectRequire.resolve('typescript/package.json')
    return projectRequire
  } catch {
    return createRequire(import.meta.url)
  }
}
