import type { Node, VariableDeclaration } from 'typescript/ast'
import type { Type } from 'typescript/sync'
import { hasPriorUnsafeAssignment } from './assignments.js'
import type { AnalyzerContext } from './context.js'
import { getKitaAlias } from './kita-types.js'
import { ESCAPE_HTML_REGEX, isJsx, SAFE_PREFIX_REGEX } from './syntax.js'

export function isSafeAttribute(
  ctx: AnalyzerContext,
  type: Type | undefined,
  node: Node
): boolean {
  const { ts, checker } = ctx
  const { TypeFlags } = ts.sync

  // Nothing to do if type cannot be resolved
  if (!type) {
    return true
  }

  // PropsWithChildren `children` names are only trusted when the type is not raw
  // string content (checked right below)
  const isChildrenName =
    (ts.is.isPropertyAccessExpression(node) && node.name.text === 'children') ||
    (ts.is.isIdentifier(node) && node.text === 'children')

  // Any and unknown types are never safe, not even when named `children`
  if (type.flags & (TypeFlags.Any | TypeFlags.Unknown)) {
    return false
  }

  if (isChildrenName) {
    // Raw string types are user content, not framework children
    if (isRawStringType(ctx, type)) {
      return false
    }

    // Unions are only framework children when they contain framework content
    // (thenables or arrays), like Html.Children does. `children?: string` and
    // `string & {}` are user content.
    if (type.isUnionType() || type.isIntersectionType()) {
      const types = type.getTypes()

      const hasUserContent = types.some(
        (innerType) =>
          isRawStringType(ctx, innerType) ||
          !!(innerType.flags & (TypeFlags.Any | TypeFlags.Unknown))
      )

      if (!hasUserContent) {
        return true
      }

      return types.some(
        (innerType) =>
          checker.isArrayType(innerType) ||
          checker.isTupleType(innerType) ||
          isPromiseLike(innerType)
      )
    }

    // Arrays and tuples are checked by their element types
    if (checker.isArrayType(type)) {
      return isSafeAttribute(ctx, getTypeArguments(ctx, type)[0], node)
    }

    if (checker.isTupleType(type)) {
      return getTypeArguments(ctx, type).every((innerType) =>
        isSafeAttribute(ctx, innerType, node)
      )
    }

    // Thenables are checked by their resolved type: `children: Promise<string>`
    // resolves to raw strings, while Promise<Children> stays safe
    if (isPromiseLike(type)) {
      return isSafeAttribute(ctx, getTypeArguments(ctx, type)[0], node)
    }

    // Generic children are trusted unless constrained to a raw string
    if (type.flags & TypeFlags.TypeParameter) {
      const constraint = checker.getBaseConstraintOfType(type)

      if (
        !constraint ||
        constraint.id === type.id ||
        constraint.flags & (TypeFlags.Any | TypeFlags.Unknown) ||
        isRawStringType(ctx, constraint)
      ) {
        return false
      }
    }

    return true
  }

  // Variables initialized with JSX (e.g., const element = <div />) are safe, but only
  // while their use-site type is still JSX-ish and they were not reassigned to user
  // content. Reassignment inside nested functions is ignored since deferred callbacks
  // run after rendering.
  if (ts.is.isIdentifier(node)) {
    const symbol = checker.getSymbolAtLocation(node)
    const jsxDeclaration =
      symbol && findJsxInitializedDeclaration(ctx, symbol.declarations)

    if (symbol && jsxDeclaration) {
      // Reassignment to user content invalidates the JSX initializer regardless of the
      // static type, which may still be the Element alias (Element contains `string`)
      if (
        hasPriorUnsafeAssignment(
          ctx,
          jsxDeclaration,
          symbol,
          node.getStart(ctx.sourceFile)
        )
      ) {
        return false
      }

      if (isJsxTypedUse(ctx, type)) {
        return true
      }
    }
  }

  // Check type aliases for JSX.Element and Html.Children
  const alias = getKitaAlias(ctx, type)

  // Allows JSX.Element (when the alias is preserved) only in .map(), other method calls
  // or the expression itself
  if (alias === 'element' && (ts.is.isCallExpression(node) || ts.is.isIdentifier(node))) {
    return true
  }

  // Allows Html.Children
  if (alias === 'children') {
    return true
  }

  // Union types should be checked recursively
  if (type.isUnionType() || type.isIntersectionType()) {
    return type.getTypes().every((innerType) => isSafeAttribute(ctx, innerType, node))
  }

  // For Array or Promise, we check the type of the first generic
  if (checker.isArrayType(type) || isPromise(type)) {
    return isSafeAttribute(ctx, getTypeArguments(ctx, type)[0], node)
  }

  const text = node.getText(ctx.sourceFile)

  // manual unsafe variables should not pass
  if (text.startsWith('unsafe')) {
    return false
  }

  // Generic type parameters (e.g. `T extends string`) hold the constraint's runtime
  // value, so safety is resolved by the constraint
  if (type.flags & TypeFlags.TypeParameter) {
    const constraint = checker.getBaseConstraintOfType(type)

    // Unconstrained parameters fall back to unknown, which is never safe
    if (!constraint || constraint.id === type.id) {
      return false
    }

    return isSafeAttribute(ctx, constraint, node)
  }

  // Template literal types (e.g. `<b>${string}</b>`) are runtime strings whose safety
  // depends on each placeholder type
  if (type.isTemplateLiteralType()) {
    return type.getTypes().every((innerType) => isSafeAttribute(ctx, innerType, node))
  }

  // Intrinsic string mappings (e.g. Uppercase<string>) are runtime strings
  if (type.isStringMappingType()) {
    return isSafeAttribute(ctx, type.getTarget(), node)
  }

  // Unresolved conditional and indexed access types (e.g. `T extends x ? y : z`,
  // `T['key']`) may hold runtime strings, so safety is resolved by their constraint
  if (type.flags & (TypeFlags.Conditional | TypeFlags.IndexedAccess)) {
    const constraint = checker.getBaseConstraintOfType(type)

    if (!constraint || constraint.id === type.id) {
      return false
    }

    return isSafeAttribute(ctx, constraint, node)
  }

  // `as 'safe'` is the documented escape hatch. Casts to any other string literal
  // launder arbitrary content into an explicitly-written literal type.
  if (ts.is.isAsExpression(node) && type.isStringLiteralType() && type.value !== 'safe') {
    return false
  }

  if (
    // We allow literal string types here, as if they have XSS content,
    // the user has explicitly written it
    !(type.flags & TypeFlags.String) &&
    // Objects may have toString() overridden
    !(type.flags & TypeFlags.Object)
  ) {
    return true
  }

  if (
    // Variables starting with safe (camelCase boundary) are suppressed
    SAFE_PREFIX_REGEX.test(text) ||
    // Starts with a call to a escapeHtml function name
    ESCAPE_HTML_REGEX.test(text)
  ) {
    return true
  }

  return false
}

/**
 * True for types that are runtime strings holding arbitrary content. String literals are
 * excluded since their value is explicitly written at compile time.
 */
export function isRawStringType(ctx: AnalyzerContext, type: Type): boolean {
  const { TypeFlags } = ctx.ts.sync

  return !!(
    type.flags &
    (TypeFlags.String | TypeFlags.TemplateLiteral | TypeFlags.StringMapping)
  )
}

/**
 * True when a JSX-initialized variable is still JSX.Element-ish at the use site.
 * Reassignment narrows the type to user content: a raw string directly, or a fresh union
 * like `Element | string`. The Element alias itself is a union containing a raw string
 * (`string | Promise<string>`), so it is checked by name.
 */
function isJsxTypedUse(ctx: AnalyzerContext, type: Type): boolean {
  const { TypeFlags } = ctx.ts.sync

  if (
    isRawStringType(ctx, type) ||
    type.flags & (TypeFlags.Any | TypeFlags.Unknown | TypeFlags.TypeParameter)
  ) {
    return false
  }

  if (
    (type.isUnionType() || type.isIntersectionType()) &&
    type.getTypes().some((innerType) => isRawStringType(ctx, innerType))
  ) {
    return getKitaAlias(ctx, type) === 'element'
  }

  return true
}

function findJsxInitializedDeclaration(
  ctx: AnalyzerContext,
  declarations: readonly { kind: number; resolve(): Node | undefined }[]
): VariableDeclaration | undefined {
  const { ts } = ctx

  for (const handle of declarations) {
    // Handles carry their kind, so only variable declarations are fetched
    if (handle.kind !== ts.ast.SyntaxKind.VariableDeclaration) {
      continue
    }

    const declaration = handle.resolve()

    if (
      declaration &&
      ts.is.isVariableDeclaration(declaration) &&
      declaration.initializer &&
      isJsx(ts, declaration.initializer)
    ) {
      return declaration
    }
  }

  return undefined
}

function getTypeArguments(ctx: AnalyzerContext, type: Type): readonly Type[] {
  return type.isTypeReference() ? ctx.checker.getTypeArguments(type) : []
}

function isPromise(type: Type): boolean {
  return type.getSymbol()?.name === 'Promise'
}

function isPromiseLike(type: Type): boolean {
  const name = type.getSymbol()?.name
  return name === 'Promise' || name === 'PromiseLike'
}
