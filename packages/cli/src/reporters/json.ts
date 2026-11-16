import { countBySeverity } from '../diagnostic.js'
import type { JsonReport } from './json-report.js'
import { NEW_LINE, relativePath, type Reporter } from './shared.js'

export type * from './json-report.js'

export const json: Reporter = (result, ctx) => {
  const report: JsonReport = {
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
