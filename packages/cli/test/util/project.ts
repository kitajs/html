import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { serverFS, type FileSystemCallbacks } from 'typescript/fs'
import { check } from '../../src/check.js'
import type { CheckResult } from '../../src/diagnostic.js'
import { normalizePath } from '../../src/paths.js'
import { loadTypeScript, type TypeScript } from '../../src/typescript.js'

export const TEST_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

/** Virtual project directory. Real `node_modules` above it still resolve from disk. */
export const VIRTUAL_DIR = path.join(TEST_DIR, 'virtual')

// Same prelude as @kitajs/ts-html-plugin's tests, so line numbers match the old suite
export const TEST_HELPERS = /* tsx */ `
  import Html, { type PropsWithChildren, e } from '@kitajs/html';

  const date = new Date();
  const safeString: string = 'safe';
  const promiseHtml = Promise.resolve(<div>Hello</div>);
  const promiseNumber = Promise.resolve(1227);
  const html: string = '<div>Hello</div>';
  const number = 1227;
  const unsafeNumber = 1227;
  const union = 1 as string | number;
  const boolean = true as boolean;
  const object = {};

  function Component(props: PropsWithChildren) {
    return <div>{props.children}</div>;
  }

  // just to avoid unused variable error
  if (process.env.NEVER) {
    console.log({
      date, e, Html,
      safeString,
      promiseHtml,
      promiseNumber,
      html,
      number,
      unsafeNumber,
      union,
      boolean,
      object,
      Component
    });
  }
`.trim()

/**
 * Compiler options matching the old suite (root tsconfig plus the plugin package's JSX
 * setup).
 */
export const VIRTUAL_TSCONFIG = JSON.stringify({
  extends: '../../tsconfig.json',
  compilerOptions: {
    jsx: 'react-jsx',
    jsxImportSource: '@kitajs/html',
    erasableSyntaxOnly: false,
    noEmit: true,
    incremental: false
  },
  files: ['index.tsx'],
  include: []
})

// The old suite ran as CommonJS; keep the same module semantics
export const VIRTUAL_PACKAGE_JSON = JSON.stringify({ type: 'commonjs' })

let typescript: Promise<TypeScript> | undefined

export function getTypeScript(): Promise<TypeScript> {
  typescript ??= loadTypeScript(TEST_DIR)
  return typescript
}

/**
 * Serves `files` (relative to {@link VIRTUAL_DIR}) from memory and everything else from
 * disk.
 */
export function virtualFileSystem(files: Record<string, string>): FileSystemCallbacks {
  const root = normalizePath(VIRTUAL_DIR)
  const contents = new Map<string, string>()
  const entries = new Map<string, { files: Set<string>; directories: Set<string> }>()

  const entry = (directory: string) => {
    let value = entries.get(directory)

    if (!value) {
      value = { files: new Set(), directories: new Set() }
      entries.set(directory, value)
    }

    return value
  }

  entry(root)

  for (const [relative, content] of Object.entries(files)) {
    const fileName = normalizePath(path.join(VIRTUAL_DIR, relative))
    contents.set(fileName, content)
    entry(path.posix.dirname(fileName)).files.add(path.posix.basename(fileName))

    // Registers every directory between the file and the virtual root
    for (
      let directory = path.posix.dirname(fileName);
      directory !== root;
      directory = path.posix.dirname(directory)
    ) {
      entry(path.posix.dirname(directory)).directories.add(path.posix.basename(directory))
    }
  }

  return {
    directoryExists: (directory) =>
      entries.has(normalizePath(directory)) || serverFS.useOS,
    fileExists: (fileName) => contents.has(normalizePath(fileName)) || serverFS.useOS,
    readFile: (fileName) => contents.get(normalizePath(fileName)) ?? serverFS.useOS,
    getAccessibleEntries: (directory) => {
      const value = entries.get(normalizePath(directory))

      if (!value) {
        return serverFS.useOS
      }

      return {
        files: [...value.files],
        directories: [...value.directories],
        symlinks: undefined
      }
    },
    realpath: (target) =>
      contents.has(normalizePath(target)) || entries.has(normalizePath(target))
        ? serverFS.identity
        : serverFS.useOS,
    stat: serverFS.fakeStat,
    writeFile: serverFS.noop,
    removeFile: serverFS.noop
  }
}

export interface CheckFilesOptions {
  projects?: string[]
  files?: string[]
  notices?: string[]
}

/** Runs `check` over an in-memory project rooted at {@link VIRTUAL_DIR}. */
export async function checkFiles(
  files: Record<string, string>,
  options: CheckFilesOptions = {}
): Promise<CheckResult> {
  return check({
    cwd: VIRTUAL_DIR,
    projects: options.projects,
    files: options.files,
    typescript: await getTypeScript(),
    onNotice: (message) => options.notices?.push(message),
    fs: virtualFileSystem(files)
  })
}

export interface TsServerDiagnostic {
  start: { line: number; offset: number }
  end: { line: number; offset: number }
  text: string
  code: number
  category: 'error' | 'warning'
}

/**
 * Checks `TEST_HELPERS` plus the given source as `index.tsx` and returns diagnostics in
 * the tsserver protocol shape the @kitajs/ts-html-plugin tests assert on.
 */
export async function openWithDiagnostics(
  content: TemplateStringsArray,
  ...args: unknown[]
): Promise<{ body: TsServerDiagnostic[] }> {
  const fileContent = `${TEST_HELPERS}\n${String.raw(content, ...args).trim()}`

  const result = await checkFiles({
    'tsconfig.json': VIRTUAL_TSCONFIG,
    'package.json': VIRTUAL_PACKAGE_JSON,
    'index.tsx': fileContent
  })

  return {
    body: result.diagnostics.map((diagnostic) => ({
      start: {
        line: diagnostic.startPosition.line + 1,
        offset: diagnostic.startPosition.character + 1
      },
      end: {
        line: diagnostic.endPosition.line + 1,
        offset: diagnostic.endPosition.character + 1
      },
      text: diagnostic.message,
      code: diagnostic.code,
      category: diagnostic.severity
    }))
  }
}
