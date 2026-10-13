import { stripVTControlCharacters } from 'node:util'
import {
  formatHost,
  NEW_LINE,
  summaryLine,
  toTsDiagnostic,
  type Reporter
} from './shared.js'

// The separator between the location and the category in TypeScript's header line, which
// may be wrapped in ANSI color codes
const HEADER_SEPARATOR = / - ((?:\x1b\[\d+m)?(?:error|warning)\b)/

/** TypeScript's colored output with code frames, followed by a summary line. */
export const pretty: Reporter = (result, ctx) => {
  const host = formatHost(ctx.cwd)
  let output = ''

  for (const [index, diagnostic] of result.diagnostics.entries()) {
    let block = ctx.ts.sync.formatDiagnosticsWithColorAndContext(
      [
        toTsDiagnostic(
          ctx.ts,
          diagnostic,
          result.sources.get(diagnostic.fileName),
          `${diagnostic.message}${NEW_LINE}See ${diagnostic.url}`
        )
      ],
      host
    )

    // Only the first match is the header; code frames may contain the same text
    if (ctx.avoidTscMatcher) {
      block = block.replace(HEADER_SEPARATOR, ': $1')
    }

    // Same separation TypeScript uses when formatting several diagnostics at once
    output += (index ? NEW_LINE : '') + block
  }

  if (result.diagnostics.length) {
    output += NEW_LINE
  }

  output += summaryLine(result) + NEW_LINE

  // TypeScript's formatter always emits ANSI codes
  return ctx.color ? output : stripVTControlCharacters(output)
}
