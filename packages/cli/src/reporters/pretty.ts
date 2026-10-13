import { stripVTControlCharacters } from 'node:util'
import {
  formatHost,
  NEW_LINE,
  summaryLine,
  toTsDiagnostic,
  type Reporter
} from './shared.js'

/** TypeScript's colored output with code frames, followed by a summary line. */
export const pretty: Reporter = (result, ctx) => {
  let output = ''

  if (result.diagnostics.length) {
    const diagnostics = result.diagnostics.map((diagnostic) =>
      toTsDiagnostic(
        ctx.ts,
        diagnostic,
        result.sources.get(diagnostic.fileName),
        `${diagnostic.message}${NEW_LINE}See ${diagnostic.url}`
      )
    )

    output += ctx.ts.sync.formatDiagnosticsWithColorAndContext(
      diagnostics,
      formatHost(ctx.cwd)
    )
    output += NEW_LINE
  }

  output += summaryLine(result) + NEW_LINE

  // TypeScript's formatter always emits ANSI codes
  return ctx.color ? output : stripVTControlCharacters(output)
}
