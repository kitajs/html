import { countBySeverity, type KitaDiagnostic } from '../diagnostic.js'
import { NEW_LINE, relativePath, type Reporter } from './shared.js'

/** Schema version of the json report. Bump on breaking changes to its shape. */
export const JSON_REPORT_VERSION = 1

export interface JsonLocation {
  /** 1-based line. */
  line: number
  /** 1-based column in UTF-16 code units. */
  column: number
  /** 0-based UTF-16 offset in the file. */
  offset: number
}

export interface JsonDiagnostic {
  file: string
  code: number
  id: string
  severity: KitaDiagnostic['severity']
  message: string
  url: string
  start: JsonLocation
  end: JsonLocation
}

export interface JsonReport {
  version: typeof JSON_REPORT_VERSION
  tool: { name: string; version: string }
  typescript: string
  projects: string[]
  summary: { filesChecked: number; errors: number; warnings: number }
  diagnostics: JsonDiagnostic[]
}

export const json: Reporter = (result, ctx) => {
  const report: JsonReport = {
    version: JSON_REPORT_VERSION,
    tool: { name: '@kitajs/html-cli', version: ctx.toolVersion },
    typescript: result.typescriptVersion,
    projects: result.projects.map((project) => relativePath(ctx.cwd, project)),
    summary: {
      filesChecked: result.filesChecked,
      ...countBySeverity(result.diagnostics)
    },
    diagnostics: result.diagnostics.map((diagnostic) => ({
      file: relativePath(ctx.cwd, diagnostic.fileName),
      code: diagnostic.code,
      id: `TS${diagnostic.code}`,
      severity: diagnostic.severity,
      message: diagnostic.message,
      url: diagnostic.url,
      start: {
        line: diagnostic.startPosition.line + 1,
        column: diagnostic.startPosition.character + 1,
        offset: diagnostic.start
      },
      end: {
        line: diagnostic.endPosition.line + 1,
        column: diagnostic.endPosition.character + 1,
        offset: diagnostic.end
      }
    }))
  }

  return JSON.stringify(report, null, 2) + NEW_LINE
}
