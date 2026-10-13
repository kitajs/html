import type { Node, SourceFile } from 'typescript/ast'
import type { Checker, Project } from 'typescript/sync'
import type { KitaDiagnostic, Severity } from '../diagnostic.js'
import { docsUrl, type KitaError } from '../errors.js'
import type { TypeScript } from '../typescript.js'

/** Which Kita-aware alias a type was declared through, if any. */
export type KitaAlias = 'element' | 'children' | undefined

export interface AnalyzerContext {
  ts: TypeScript
  checker: Checker
  project: Project
  sourceFile: SourceFile
  /** Normalized real path of the project's `@kitajs/html` package, when resolvable. */
  kitaRoot: string | undefined
  diagnostics: KitaDiagnostic[]
  /** Alias lookups are IPC round trips, so they are cached per type id. */
  aliasCache: Map<number, KitaAlias>
}

export function report(
  ctx: AnalyzerContext,
  node: Node,
  error: KitaError,
  severity: Severity
): void {
  const start = node.getStart(ctx.sourceFile)
  const end = node.getEnd()

  ctx.diagnostics.push({
    fileName: ctx.sourceFile.fileName,
    start,
    end,
    startPosition: ctx.sourceFile.getLineAndCharacterOfPosition(start),
    endPosition: ctx.sourceFile.getLineAndCharacterOfPosition(end),
    code: error.code,
    severity,
    message: error.message,
    url: docsUrl(error.code)
  })
}
