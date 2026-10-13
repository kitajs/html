import { NEW_LINE, relativePath, summaryLine, type Reporter } from './shared.js'
import { tsc } from './tsc.js'

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
 * the tsc lines follow to keep the full list visible.
 */
export const github: Reporter = (result, ctx) => {
  // Annotations only attach to files when paths are relative to the repository root
  const base = ctx.workspace || ctx.cwd
  let output = ''

  for (const diagnostic of result.diagnostics) {
    const properties = [
      `file=${escapeProperty(relativePath(base, diagnostic.fileName))}`,
      `line=${diagnostic.startPosition.line + 1}`,
      `col=${diagnostic.startPosition.character + 1}`,
      `endLine=${diagnostic.endPosition.line + 1}`,
      `endColumn=${diagnostic.endPosition.character + 1}`,
      `title=${escapeProperty(`TS${diagnostic.code}`)}`
    ].join(',')

    output += `::${diagnostic.severity} ${properties}::${escapeData(
      `${diagnostic.message} See ${diagnostic.url}`
    )}${NEW_LINE}`
  }

  output += tsc(result, ctx)
  output += summaryLine(result) + NEW_LINE

  return output
}
