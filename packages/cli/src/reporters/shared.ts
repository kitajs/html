import path from 'node:path'
import type { FormatDiagnosticsHost, Diagnostic as TsDiagnostic } from 'typescript/sync'
import { countBySeverity, type CheckResult, type KitaDiagnostic } from '../diagnostic.js'
import { caseInsensitiveFileSystem, normalizePath } from '../paths.js'
import type { TypeScript } from '../typescript.js'

export interface ReportContext {
  ts: TypeScript
  /** Base directory for relative paths. */
  cwd: string
  /** ANSI colors for the pretty format. */
  color: boolean
  /** Repository root for GitHub annotations (`GITHUB_WORKSPACE`), when set. */
  workspace?: string | undefined
  /** Version of this CLI, reported by the json format. */
  toolVersion: string
  /**
   * Prints pretty headers as `file:line:col: error` instead of `file:line:col - error`,
   * so the `tsc` problem matcher of `actions/setup-node` does not annotate findings that
   * the `github` format already annotates. Set when `github` is one of the formats.
   */
  avoidTscMatcher?: boolean | undefined
}

export type Reporter = (result: CheckResult, ctx: ReportContext) => string

export const NEW_LINE = '\n'

/** Relative path with forward slashes on every OS. */
export function relativePath(from: string, fileName: string): string {
  return path.relative(from, fileName).split(path.sep).join('/').replace(/\\/g, '/')
}

/**
 * The API reports forward-slash paths, while `process.cwd()` uses backslashes on Windows.
 * Both are normalized so TypeScript's formatters can relativize them.
 */
export function formatHost(cwd: string): FormatDiagnosticsHost {
  return {
    getCurrentDirectory: () => normalizePath(cwd),
    getCanonicalFileName: (fileName) =>
      caseInsensitiveFileSystem ? fileName.toLowerCase() : fileName,
    getNewLine: () => NEW_LINE
  }
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

export function summaryLine(result: CheckResult): string {
  const { errors, warnings } = countBySeverity(result.diagnostics)

  if (!errors && !warnings) {
    return `No XSS issues found in ${plural(result.filesChecked, 'file')}.`
  }

  const files = new Set(result.diagnostics.map((diagnostic) => diagnostic.fileName)).size
  const counts = [
    errors && plural(errors, 'error'),
    warnings && plural(warnings, 'warning')
  ]
    .filter(Boolean)
    .join(' and ')

  return `Found ${counts} in ${plural(files, 'file')}.`
}

/**
 * Converts a diagnostic to the TypeScript API shape so TypeScript's own formatters can
 * print it. Spans longer than five lines keep only their first and last two lines, which
 * the formatter joins with an ellipsis like `tsc` does.
 */
export function toTsDiagnostic(
  ts: TypeScript,
  diagnostic: KitaDiagnostic,
  source: string | undefined,
  text: string
): TsDiagnostic {
  const { startPosition, endPosition } = diagnostic
  const lines = source?.split(/\r?\n/) ?? []
  const sourceLines: { line: number; text: string }[] = []
  const long = endPosition.line - startPosition.line >= 4

  for (let line = startPosition.line; line <= endPosition.line; line++) {
    if (long && line > startPosition.line + 1 && line < endPosition.line - 1) {
      continue
    }

    sourceLines.push({ line, text: lines[line] ?? '' })
  }

  return {
    fileName: diagnostic.fileName as TsDiagnostic['fileName'],
    pos: diagnostic.start,
    end: diagnostic.end,
    startPosition,
    endPosition,
    sourceLines,
    code: diagnostic.code,
    category:
      diagnostic.severity === 'error'
        ? ts.sync.DiagnosticCategory.Error
        : ts.sync.DiagnosticCategory.Warning,
    text
  }
}
