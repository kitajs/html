import type { Node, VariableDeclaration } from 'typescript/ast'
import type { Symbol, Type } from 'typescript/sync'
import type { AnalyzerContext } from './context.js'
import { getKitaAlias } from './kita-types.js'
import { isRawStringType } from './safety.js'
import { isJsx } from './syntax.js'

/**
 * True when `symbol` is assigned user content before `usePos` in the scope containing
 * `declaration`. Nested functions are skipped: deferred callbacks run after rendering, so
 * their writes cannot be ordered against the use.
 */
export function hasPriorUnsafeAssignment(
  ctx: AnalyzerContext,
  declaration: VariableDeclaration,
  symbol: Symbol,
  usePos: number
): boolean {
  const { ts, checker } = ctx
  const { SyntaxKind } = ts.ast

  let scope: Node = declaration
  while (
    scope.parent &&
    !ts.is.isFunctionLikeDeclaration(scope) &&
    !ts.is.isSourceFile(scope)
  ) {
    scope = scope.parent
  }

  let found = false

  function visit(current: Node): void {
    if (found) {
      return
    }

    if (current !== scope && ts.is.isFunctionLikeDeclaration(current)) {
      return
    }

    if (
      // `x = value` or `x += value` assignment expression
      ts.is.isBinaryExpression(current) &&
      (current.operatorToken.kind === SyntaxKind.EqualsToken ||
        current.operatorToken.kind === SyntaxKind.PlusEqualsToken) &&
      // plain variable writes only; destructuring and member writes are not tracked
      ts.is.isIdentifier(current.left) &&
      // only assignments that textually precede the use site
      current.left.getEnd() <= usePos &&
      // the assignment targets the JSX-initialized variable
      checker.getSymbolAtLocation(current.left)?.id === symbol.id &&
      // JSX assigned values keep the variable JSX-ish
      !isJsx(ts, current.right) &&
      // the assigned value is user content (raw string, any, etc.)
      isUnsafeAssignedValue(ctx, checker.getTypeAtLocation(current.right))
    ) {
      found = true
      return
    }

    current.forEachChild(visit)
  }

  visit(scope)
  return found
}

/**
 * True for assigned values that invalidate a JSX initializer. The Element alias itself
 * contains a raw string member by design (`string | Promise<string>`), so it is checked
 * by name to keep `content = element` assignments safe.
 */
function isUnsafeAssignedValue(ctx: AnalyzerContext, type: Type): boolean {
  const { TypeFlags } = ctx.ts.sync

  if (
    isRawStringType(ctx, type) ||
    type.flags & (TypeFlags.Any | TypeFlags.Unknown | TypeFlags.TypeParameter)
  ) {
    return true
  }

  if (
    (type.isUnionType() || type.isIntersectionType()) &&
    type.getTypes().some((innerType) => isRawStringType(ctx, innerType))
  ) {
    return getKitaAlias(ctx, type) !== 'element'
  }

  return false
}
