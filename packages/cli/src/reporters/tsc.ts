import { formatHost, toTsDiagnostic, type Reporter } from './shared.js'

/**
 * Same line format as `tsc`, so existing tooling (VS Code's `$tsc` problem matcher, CI
 * parsers) understands it. Prints nothing when there are no diagnostics.
 */
export const tsc: Reporter = (result, ctx) =>
  ctx.ts.sync.formatDiagnostics(
    result.diagnostics.map((diagnostic) =>
      toTsDiagnostic(ctx.ts, diagnostic, undefined, diagnostic.message)
    ),
    formatHost(ctx.cwd)
  )
