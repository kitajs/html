import { NEW_LINE, relativePath, summaryLine, type Reporter } from './shared.js'

// https://docs.github.com/actions/reference/workflows-and-actions/workflow-commands
export function escapeData(value: string): string {
  return value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')
}

export function escapeProperty(value: string): string {
  return escapeData(value).replace(/:/g, '%3A').replace(/,/g, '%2C')
}

/**
 * One workflow command per diagnostic, so findings show as annotations on the pull
 * request. GitHub hides workflow commands from the log and caps annotations per step, so
 * a plain line per finding follows to keep the full list visible. Those lines use
 * `file:line:col: severity TScode: message` on purpose: `actions/setup-node` registers
 * the `tsc` problem matcher, which would annotate tsc-formatted lines a second time.
 */
export const github: Reporter = (result, ctx) => {
  // Annotations only attach to files when paths are relative to the repository root
  const base = ctx.workspace || ctx.cwd
  let annotations = ''
  let lines = ''

  for (const diagnostic of result.diagnostics) {
    const start = diagnostic.startPosition
    const properties = [
      `file=${escapeProperty(relativePath(base, diagnostic.fileName))}`,
      `line=${start.line + 1}`,
      `col=${start.character + 1}`,
      `endLine=${diagnostic.endPosition.line + 1}`,
      `endColumn=${diagnostic.endPosition.character + 1}`,
      `title=${escapeProperty(`TS${diagnostic.code}`)}`
    ].join(',')

    annotations += `::${diagnostic.severity} ${properties}::${escapeData(
      `${diagnostic.message} See ${diagnostic.url}`
    )}${NEW_LINE}`

    lines += `${relativePath(ctx.cwd, diagnostic.fileName)}:${start.line + 1}:${
      start.character + 1
    }: ${diagnostic.severity} TS${diagnostic.code}: ${diagnostic.message}${NEW_LINE}`
  }

  return annotations + lines + summaryLine(result) + NEW_LINE
}
