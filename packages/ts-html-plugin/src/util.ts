import {
  type JsxFragment,
  type JsxSelfClosingElement,
  type default as ts
} from 'typescript'
import type {
  BinaryOperatorToken,
  Diagnostic,
  JsxElement,
  JsxOpeningElement,
  Node,
  StringLiteralType,
  TemplateLiteralType,
  default as TS,
  Type,
  TypeChecker
} from 'typescript/lib/tsserverlibrary'
import * as Errors from './errors'

const UPPERCASE = /[A-Z]/
const ESCAPE_HTML_REGEX = /^(\w+\.)?((escapeHtml|escape)(<[^(`]*>)?\s*[(`]|e\s*`)/i
const SAFE_PREFIX_REGEX = /^safe($|[^a-z])/

/** If the node is a JSX element or fragment */
function isJsx(
  ts: typeof TS,
  node: TS.Node
): node is JsxElement | JsxFragment | JsxSelfClosingElement {
  return (
    ts.isJsxElement(node) || ts.isJsxFragment(node) || ts.isJsxSelfClosingElement(node)
  )
}

export function recursiveDiagnoseJsxElements(
  ts: typeof TS,
  node: Node,
  typeChecker: TypeChecker,
  original: Diagnostic[]
) {
  ts.forEachChild(node, function loopSourceNodes(node) {
    // Recurse through children first
    ts.forEachChild(node, loopSourceNodes)

    // Adds children to the array
    if (isJsx(ts, node)) {
      // Diagnose the node
      diagnoseJsxElement(ts, node, typeChecker, original)
    }
  })

  // Filter out duplicates
  for (let i = 0; i < original.length; i++) {
    for (let j = i + 1; j < original.length; j++) {
      if (
        original[i]!.start === original[j]!.start &&
        original[i]!.length === original[j]!.length
      ) {
        original.splice(j--, 1)
      }
    }
  }
}

function diagnostic(
  ts: typeof TS,
  node: ts.Node,
  error: keyof typeof Errors,
  category: keyof typeof TS.DiagnosticCategory
): ts.Diagnostic {
  return {
    category: ts.DiagnosticCategory[category],
    messageText: Errors[error].message,
    code: Errors[error].code,
    file: node.getSourceFile(),
    length: node.getWidth(),
    start: node.getStart()
  }
}

export function diagnoseJsxElement(
  ts: typeof TS,
  node: JsxElement | JsxFragment | JsxSelfClosingElement,
  typeChecker: TypeChecker,
  diagnostics: Diagnostic[]
): void {
  // Validations that does not applies to fragments or serlf closing elements
  if (ts.isJsxElement(node)) {
    // Script tags should be ignored
    if (node.openingElement.tagName.getText() === 'script') {
      return
    }

    const safeAttribute = getSafeAttribute(node.openingElement)

    // Safe mode warnings
    if (safeAttribute && node.children) {
      if (
        // Empty element
        node.children.length === 0 ||
        // Only text elements
        (node.children.length === 1 && node.children[0]!.kind === ts.SyntaxKind.JsxText)
      ) {
        diagnostics.push(diagnostic(ts, safeAttribute, 'UnusedSafe', 'Warning'))
        return
      }

      for (const exp of node.children) {
        if (
          // JSX Element inside safe (includes self-closing elements like <Component />)
          isJsx(ts, exp) ||
          // Element is using safe with escapeHtml
          (ts.isJsxExpression(exp) && exp.expression?.getText().match(ESCAPE_HTML_REGEX))
        ) {
          diagnostics.push(diagnostic(ts, safeAttribute, 'DoubleEscape', 'Error'))
          continue
        }

        // Warn on unnecessary safe attributes
        if (
          ts.isJsxExpression(exp) &&
          // has inner expression
          exp.expression
        ) {
          // gets this expression or array of sub expressions
          const expressions = getNodeExpressions(ts, exp.expression) || [exp.expression]

          // at least one jsx inside another jsx with safe (includes self-closing elements)
          if (expressions.some((inner) => isJsx(ts, inner))) {
            diagnostics.push(diagnostic(ts, safeAttribute, 'DoubleEscape', 'Error'))
            continue
          }

          // all of them must be safe
          if (
            expressions.every((inner) =>
              isSafeAttribute(
                ts,
                typeChecker.getTypeAtLocation(inner),
                typeChecker,
                inner
              )
            )
          ) {
            diagnostics.push(diagnostic(ts, safeAttribute, 'UnusedSafe', 'Warning'))
          }
        }
      }

      return
    }
  }

  // If this expression does not have children, we can ignore it
  // for example it could be a self closing element
  if (ts.isJsxSelfClosingElement(node) || !node.children) {
    return
  }

  // Look for expressions
  for (const exp of node.children) {
    if (!ts.isJsxExpression(exp)) {
      continue
    }

    // Should always have an expression
    if (!exp.expression) {
      continue
    }

    diagnoseExpression(
      ts,
      exp.expression,
      typeChecker,
      diagnostics,
      ts.isJsxElement(node) && !!node.openingElement.tagName.getText().match(UPPERCASE)
    )
  }

  return
}

function diagnoseExpression(
  ts: typeof TS,
  node: ts.Expression,
  typeChecker: TypeChecker,
  diagnostics: Diagnostic[],
  isComponent: boolean
): void {
  // Unwrap parenthesis
  while (ts.isParenthesizedExpression(node)) {
    node = node.expression
  }

  // Ignores JSX elements as they are already diagnosed by the loopChildNodes
  if (isJsx(ts, node)) {
    return
  }

  const expressions = getNodeExpressions(ts, node)

  // ternary or binary expressions should be evaluated on each side
  if (expressions) {
    for (const inner of expressions) {
      diagnoseExpression(ts, inner, typeChecker, diagnostics, isComponent)
    }

    return
  }

  const type = typeChecker.getTypeAtLocation(node)

  // Safe can be ignored
  if (isSafeAttribute(ts, type, typeChecker, node)) {
    return
  }

  // Anything other than a identifier should be diagnosed
  if (!ts.isIdentifier(node)) {
    let hadJsx = false

    for (const tag of node.getChildren()) {
      if (!isJsx(ts, tag)) {
        continue
      }

      hadJsx = true

      diagnoseJsxElement(ts, tag, typeChecker, diagnostics)
    }

    // If root JSX element found inside array, diagnose it,
    // otherwise let the diagnostic pass
    if (hadJsx) {
      return
    }
  }

  // Switch between component and element xss errors
  if (isComponent || ts.isJsxFragment(node)) {
    diagnostics.push(diagnostic(ts, node, 'ComponentXss', 'Error'))
  } else {
    diagnostics.push(diagnostic(ts, node, 'Xss', 'Error'))
  }
}

export function isSafeAttribute(
  ts: typeof TS,
  type: Type | undefined,
  checker: TypeChecker,
  node: ts.Node
): boolean {
  // Nothing to do if type cannot be resolved
  if (!type) {
    return true
  }

  // PropsWithChildren `children` names are only trusted when the type is not raw
  // string content (checked right below)
  const isChildrenName =
    (ts.isPropertyAccessExpression(node) && node.name.text === 'children') ||
    (ts.isIdentifier(node) && node.text === 'children')

  // Any and unknown types are never safe, not even when named `children`
  if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return false
  }

  if (isChildrenName) {
    // Raw string types are user content, not framework children
    if (isRawStringType(ts, type)) {
      return false
    }

    // Unions are only framework children when they contain framework content
    // (thenables or arrays), like Html.Children does. `children?: string` and
    // `string & {}` are user content.
    if (type.isUnionOrIntersection()) {
      const hasUserContent = type.types.some(
        (innerType) =>
          isRawStringType(ts, innerType) ||
          !!(innerType.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown))
      )

      if (!hasUserContent) {
        return true
      }

      return type.types.some(
        (innerType) =>
          checker.isArrayType(innerType) ||
          checker.isTupleType(innerType) ||
          innerType.symbol?.escapedName === 'Promise' ||
          innerType.symbol?.escapedName === 'PromiseLike'
      )
    }

    // Arrays and tuples are checked by their element types
    if (checker.isArrayType(type)) {
      return isSafeAttribute(ts, (type as any).resolvedTypeArguments?.[0], checker, node)
    }

    if (checker.isTupleType(type)) {
      const elements = ((type as any).resolvedTypeArguments ?? []) as Type[]
      return elements.every((innerType) => isSafeAttribute(ts, innerType, checker, node))
    }

    // Thenables are checked by their resolved type: `children: Promise<string>`
    // resolves to raw strings, while Promise<Children> stays safe
    if (
      type.symbol?.escapedName === 'Promise' ||
      type.symbol?.escapedName === 'PromiseLike'
    ) {
      return isSafeAttribute(ts, (type as any).resolvedTypeArguments?.[0], checker, node)
    }

    // Generic children are trusted unless constrained to a raw string
    if (type.flags & ts.TypeFlags.TypeParameter) {
      const constraint = checker.getBaseConstraintOfType(type)

      if (
        !constraint ||
        constraint === type ||
        constraint.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown) ||
        isRawStringType(ts, constraint)
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
  if (ts.isIdentifier(node)) {
    const symbol = checker.getSymbolAtLocation(node)
    const declarations = symbol?.getDeclarations()
    const jsxDeclaration = declarations?.find(
      (decl): decl is TS.VariableDeclaration =>
        ts.isVariableDeclaration(decl) &&
        !!decl.initializer &&
        isJsx(ts, decl.initializer)
    )

    if (symbol && jsxDeclaration) {
      // Reassignment to user content invalidates the JSX initializer regardless of the
      // static type, which may still be the Element alias (Element contains `string`)
      if (
        hasPriorUnsafeAssignment(ts, checker, jsxDeclaration, symbol, node.getStart())
      ) {
        return false
      }

      if (isJsxTypedUse(ts, type)) {
        return true
      }
    }
  }

  // Check type aliases for JSX.Element and Html.Children
  if (type.aliasSymbol) {
    // Allows JSX.Element (when the alias is preserved)
    if (
      node &&
      type.aliasSymbol.escapedName === 'Element' &&
      // @ts-expect-error - Fast way of checking
      type.aliasSymbol.parent?.escapedName === 'JSX' &&
      // Only allows in .map(), other method calls or the expression itself
      (ts.isCallExpression(node) || ts.isIdentifier(node))
    ) {
      return true
    }

    // Allows Html.Children
    if (
      type.aliasSymbol.escapedName === 'Children' &&
      // @ts-expect-error - When using export namespace X {} and export default X, parent.escapedName
      // ends up as the original namespace name, not the quoted export name.
      (type.aliasSymbol.parent?.escapedName === 'Html' ||
        // @ts-expect-error - When using export as namespace X, parent.escapedName ends up
        // as a complete (without resolving symlinks) quoted import path to its original file.
        type.aliasSymbol.parent?.escapedName.endsWith('@kitajs/html/index"') ||
        // This is needed because of the resolved path of the parent if is installed with pnpm is a symlink
        // that ts resolves to the original file path, so the path is not related to the node_modules but instead
        // is absolute to the file system (this is only here because of the monorepo setup, it is not needed when used as a package)
        (process.env.KITA_TS_HTML_PLUGIN_TESTING === 'true' &&
          // @ts-expect-error - When using export as namespace X, parent.escapedName ends up
          type.aliasSymbol.parent?.escapedName.endsWith('packages/html/index"')))
    ) {
      return true
    }
  }

  // Union types should be checked recursively
  if (type.isUnionOrIntersection()) {
    return type.types.every((innerType) => isSafeAttribute(ts, innerType, checker, node))
  }

  // For Array or Promise, we check the type of the first generic
  if (checker.isArrayType(type) || type.symbol?.escapedName === 'Promise') {
    return isSafeAttribute(ts, (type as any).resolvedTypeArguments?.[0], checker, node)
  }

  const text = node.getText()

  // manual unsafe variables should not pass
  if (text.startsWith('unsafe')) {
    return false
  }

  // Generic type parameters (e.g. `T extends string`) hold the constraint's runtime
  // value, so safety is resolved by the constraint
  if (type.flags & ts.TypeFlags.TypeParameter) {
    const constraint = checker.getBaseConstraintOfType(type)

    // Unconstrained parameters fall back to unknown, which is never safe
    if (!constraint || constraint === type) {
      return false
    }

    return isSafeAttribute(ts, constraint, checker, node)
  }

  // Template literal types (e.g. `<b>${string}</b>`) are runtime strings whose safety
  // depends on each placeholder type
  if (type.flags & ts.TypeFlags.TemplateLiteral) {
    return (type as TemplateLiteralType).types.every((innerType) =>
      isSafeAttribute(ts, innerType, checker, node)
    )
  }

  // Intrinsic string mappings (e.g. Uppercase<string>) are runtime strings
  if (type.flags & ts.TypeFlags.StringMapping) {
    const source = (type as any).type as Type | undefined
    return source !== undefined && isSafeAttribute(ts, source, checker, node)
  }

  // Unresolved conditional and indexed access types (e.g. `T extends x ? y : z`,
  // `T['key']`) may hold runtime strings, so safety is resolved by their constraint
  if (type.flags & (ts.TypeFlags.Conditional | ts.TypeFlags.IndexedAccess)) {
    const constraint = checker.getBaseConstraintOfType(type)

    if (!constraint || constraint === type) {
      return false
    }

    return isSafeAttribute(ts, constraint, checker, node)
  }

  // `as 'safe'` is the documented escape hatch. Casts to any other string literal
  // launder arbitrary content into an explicitly-written literal type.
  if (
    ts.isAsExpression(node) &&
    type.flags & ts.TypeFlags.StringLiteral &&
    (type as StringLiteralType).value !== 'safe'
  ) {
    return false
  }

  if (
    // We allow literal string types here, as if they have XSS content,
    // the user has explicitly written it
    !(type.flags & ts.TypeFlags.String) &&
    // Objects may have toString() overridden
    !(type.flags & ts.TypeFlags.Object)
  ) {
    return true
  }

  if (
    // Variables starting with safe (camelCase boundary) are suppressed
    SAFE_PREFIX_REGEX.test(text) ||
    // Starts with a call to a escapeHtml function name
    text.match(ESCAPE_HTML_REGEX)
  ) {
    return true
  }

  return false
}

/**
 * True for types that are runtime strings holding arbitrary content. String literals are
 * excluded since their value is explicitly written at compile time.
 */
function isRawStringType(ts: typeof TS, type: Type): boolean {
  return !!(
    type.flags &
    (ts.TypeFlags.String | ts.TypeFlags.TemplateLiteral | ts.TypeFlags.StringMapping)
  )
}

/**
 * True when a JSX-initialized variable is still JSX.Element-ish at the use site.
 * Reassignment narrows the type to user content: a raw string directly, or a fresh union
 * like `Element | string`. The Element alias itself is a union containing a raw string
 * (`string | Promise<string>`), so it is checked by name.
 */
function isJsxTypedUse(ts: typeof TS, type: Type): boolean {
  if (
    isRawStringType(ts, type) ||
    type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter)
  ) {
    return false
  }

  if (
    type.isUnionOrIntersection() &&
    type.types.some((innerType) => isRawStringType(ts, innerType))
  ) {
    return (
      type.aliasSymbol?.escapedName === 'Element' &&
      // @ts-expect-error - Fast way of checking
      type.aliasSymbol.parent?.escapedName === 'JSX'
    )
  }

  return true
}

/**
 * True when `symbol` is assigned user content before `usePos` in the scope containing
 * `declaration`. Nested functions are skipped: deferred callbacks run after rendering, so
 * their writes cannot be ordered against the use.
 */
function hasPriorUnsafeAssignment(
  ts: typeof TS,
  checker: TypeChecker,
  declaration: TS.VariableDeclaration,
  symbol: TS.Symbol,
  usePos: number
): boolean {
  let scope: ts.Node = declaration
  while (scope.parent && !ts.isFunctionLike(scope) && !ts.isSourceFile(scope)) {
    scope = scope.parent
  }

  let found = false

  function visit(current: ts.Node): void {
    if (found) {
      return
    }

    if (current !== scope && ts.isFunctionLike(current)) {
      return
    }

    if (
      // `x = value` or `x += value` assignment expression
      ts.isBinaryExpression(current) &&
      (current.operatorToken.kind === ts.SyntaxKind.EqualsToken ||
        current.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken) &&
      // plain variable writes only; destructuring and member writes are not tracked
      ts.isIdentifier(current.left) &&
      // only assignments that textually precede the use site
      current.left.getEnd() <= usePos &&
      // the assignment targets the JSX-initialized variable
      checker.getSymbolAtLocation(current.left) === symbol &&
      // JSX assigned values keep the variable JSX-ish
      !isJsx(ts, current.right) &&
      // the assigned value is user content (raw string, any, etc.)
      isUnsafeAssignedValue(ts, checker.getTypeAtLocation(current.right))
    ) {
      found = true
      return
    }

    ts.forEachChild(current, visit)
  }

  visit(scope)
  return found
}

/**
 * True for assigned values that invalidate a JSX initializer. The Element alias itself
 * contains a raw string member by design (`string | Promise<string>`), so it is checked
 * by name to keep `content = element` assignments safe.
 */
function isUnsafeAssignedValue(ts: typeof TS, type: Type): boolean {
  if (
    isRawStringType(ts, type) ||
    type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter)
  ) {
    return true
  }

  if (
    type.isUnionOrIntersection() &&
    type.types.some((innerType) => isRawStringType(ts, innerType))
  ) {
    return (
      type.aliasSymbol?.escapedName !== 'Element' ||
      // @ts-expect-error - Fast way of checking
      type.aliasSymbol.parent?.escapedName !== 'JSX'
    )
  }

  return false
}

export function getSafeAttribute(element: JsxOpeningElement) {
  for (const attribute of element.attributes.properties) {
    if (attribute.getText() === 'safe') {
      return attribute
    }
  }

  return undefined
}

export function proxyObject<T extends object>(obj: T): T {
  const proxy: T = Object.create(null)

  for (const k of Object.keys(obj) as Array<keyof T>) {
    const x = obj[k]!
    // @ts-expect-error - JS runtime trickery which is tricky to type tersely
    proxy[k] = (...args: Array<{}>) => x.apply(obj, args)
  }

  return proxy
}

/**
 * Returns more than one node if the node is a binary expression or a conditional
 * expression
 */
function getNodeExpressions(
  ts: typeof TS,
  node: TS.Expression
): TS.Expression[] | undefined {
  // Checks operators
  if (ts.isBinaryExpression(node)) {
    // Ignores operations which results in a boolean
    if (isBooleanBinaryOperatorToken(ts, node.operatorToken)) {
      return []
    }

    // For && operator, the left side is only rendered when falsy
    // (empty string, null, undefined, 0, false, NaN) - none of which are XSS risks
    // So we only need to diagnose the right side
    if (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      return [node.right]
    }

    // For || and ?? operators, both sides can be rendered with potentially unsafe values
    // So we diagnose both sides
    return [node.left, node.right]
  }

  // Checks the inner expression
  if (ts.isConditionalExpression(node)) {
    // ignore node.condition because its value will never be rendered
    return [node.whenTrue, node.whenFalse]
  }

  return undefined
}

function isBooleanBinaryOperatorToken(ts: typeof TS, operator: BinaryOperatorToken) {
  switch (operator.kind) {
    case ts.SyntaxKind.EqualsEqualsEqualsToken:
    case ts.SyntaxKind.EqualsEqualsToken:
    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
    case ts.SyntaxKind.ExclamationEqualsToken:
    case ts.SyntaxKind.GreaterThanToken:
    case ts.SyntaxKind.GreaterThanEqualsToken:
    case ts.SyntaxKind.LessThanEqualsToken:
    case ts.SyntaxKind.LessThanToken:
    case ts.SyntaxKind.InstanceOfKeyword:
    case ts.SyntaxKind.InKeyword:
      return true
  }

  return false
}
