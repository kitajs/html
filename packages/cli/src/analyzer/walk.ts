import type { Node } from 'typescript/ast'
import type { KitaDiagnostic } from '../diagnostic.js'
import type { AnalyzerContext } from './context.js'
import { diagnoseJsxElement } from './element.js'
import { isJsx } from './syntax.js'

/** Diagnoses every JSX element in the context's source file. */
export function diagnoseSourceFile(ctx: AnalyzerContext): KitaDiagnostic[] {
  const { ts } = ctx

  ctx.sourceFile.forEachChild(function loopSourceNodes(node: Node): void {
    // Recurse through children first
    node.forEachChild(loopSourceNodes)

    if (isJsx(ts, node)) {
      diagnoseJsxElement(ctx, node)
    }
  })

  // Nested elements can be diagnosed more than once through diagnoseExpression
  const seen = new Set<string>()

  return ctx.diagnostics.filter((diagnostic) => {
    const key = `${diagnostic.start}:${diagnostic.end}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}
