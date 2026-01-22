import ts, { type JsxFragment } from 'typescript';
import type {
  BinaryOperatorToken,
  Diagnostic,
  JsxElement,
  JsxOpeningElement,
  Node,
  default as TS,
  Type,
  TypeChecker
} from 'typescript/lib/tsserverlibrary';
import * as Errors from './errors';

const UPPERCASE = /[A-Z]/;
const ESCAPE_HTML_REGEX = /^(\w+\.)?(escapeHtml|e\s*`|escape)/i;

/** If the node is a JSX element or fragment */
export function isJsx(ts: typeof TS, node: TS.Node): node is JsxElement | JsxFragment {
  return (
    ts.isJsxElement(node) || ts.isJsxFragment(node) || ts.isJsxSelfClosingElement(node)
  );
}

export function recursiveDiagnoseJsxElements(
  ts: typeof TS,
  node: Node,
  typeChecker: TypeChecker,
  original: Diagnostic[]
) {
  ts.forEachChild(node, function loopSourceNodes(node) {
    // Recurse through children first
    ts.forEachChild(node, loopSourceNodes);

    // Adds children to the array
    if (isJsx(ts, node)) {
      // Diagnose the node
      diagnoseJsxElement(ts, node, typeChecker, original);
    }
  });

  // Filter out duplicates
  for (let i = 0; i < original.length; i++) {
    for (let j = i + 1; j < original.length; j++) {
      if (
        original[i]!.start === original[j]!.start &&
        original[i]!.length === original[j]!.length
      ) {
        original.splice(j--, 1);
      }
    }
  }
}

function diagnostic(
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
  };
}

export function diagnoseJsxElement(
  ts: typeof TS,
  node: JsxElement | JsxFragment,
  typeChecker: TypeChecker,
  diagnostics: Diagnostic[]
): void {
  // Validations that does not applies to fragments or serlf closing elements
  if (ts.isJsxElement(node)) {
    // Script tags should be ignored
    if (node.openingElement.tagName.getText() === 'script') {
      return;
    }

    const safeAttribute = getSafeAttribute(node.openingElement);

    // Safe mode warnings
    if (safeAttribute && node.children) {
      if (
        // Empty element
        node.children.length === 0 ||
        // Only text elements
        (node.children.length === 1 && node.children[0]!.kind === ts.SyntaxKind.JsxText)
      ) {
        diagnostics.push(diagnostic(safeAttribute, 'UnusedSafe', 'Warning'));
        return;
      }

      for (const exp of node.children) {
        if (
          // JSX Element inside safe
          ts.isJsxElement(exp) ||
          // Element is using safe with escapeHtml
          (ts.isJsxExpression(exp) && exp.expression?.getText().match(ESCAPE_HTML_REGEX))
        ) {
          diagnostics.push(diagnostic(safeAttribute, 'DoubleEscape', 'Error'));
          continue;
        }

        // Warn on unnecessary safe attributes
        if (
          ts.isJsxExpression(exp) &&
          // has inner expression
          exp.expression
        ) {
          // gets this expression or array of sub expressions
          const expressions = getNodeExpressions(exp.expression) || [exp.expression];

          // at least one jsx inside another jsx with safe
          if (expressions.some((inner) => ts.isJsxElement(inner))) {
            diagnostics.push(diagnostic(safeAttribute, 'DoubleEscape', 'Error'));
            continue;
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
            diagnostics.push(diagnostic(safeAttribute, 'UnusedSafe', 'Warning'));
          }
        }
      }

      return;
    }
  }

  // If this expression does not have children, we can ignore it
  // for example it could be a self closing element
  if (!node.children) {
    return;
  }

  // Look for expressions
  for (const exp of node.children) {
    if (!ts.isJsxExpression(exp)) {
      continue;
    }

    // Should always have an expression
    if (!exp.expression) {
      continue;
    }

    diagnoseExpression(
      ts,
      exp.expression,
      typeChecker,
      diagnostics,
      ts.isJsxElement(node) && !!node.openingElement.tagName.getText().match(UPPERCASE)
    );
  }

  return;
}

function diagnoseExpression(
  ts: typeof TS,
  node: ts.Expression,
  typeChecker: TypeChecker,
  diagnostics: Diagnostic[],
  isComponent: boolean
): void {
  // Unwrap parenthesis
  if (ts.isParenthesizedExpression(node)) {
    node = node.expression;
  }

  // Ignores JSX elements as they are already diagnosed by the loopChildNodes
  if (isJsx(ts, node)) {
    return;
  }

  const expressions = getNodeExpressions(node);

  // ternary or binary expressions should be evaluated on each side
  if (expressions) {
    for (const inner of expressions) {
      diagnoseExpression(ts, inner, typeChecker, diagnostics, isComponent);
    }

    return;
  }

  const type = typeChecker.getTypeAtLocation(node);

  // Safe can be ignored
  if (isSafeAttribute(ts, type, typeChecker, node)) {
    return;
  }

  // Anything other than a identifier should be diagnosed
  if (!ts.isIdentifier(node)) {
    let hadJsx = false;

    for (const tag of node.getChildren()) {
      if (!isJsx(ts, tag)) {
        continue;
      }

      hadJsx = true;

      diagnoseJsxElement(ts, tag, typeChecker, diagnostics);
    }

    // If root JSX element found inside array, diagnose it,
    // otherwise let the diagnostic pass
    if (hadJsx) {
      return;
    }
  }

  // Switch between component and element xss errors
  if (isComponent || ts.isJsxFragment(node)) {
    diagnostics.push(diagnostic(node, 'ComponentXss', 'Error'));
  } else {
    diagnostics.push(diagnostic(node, 'Xss', 'Error'));
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
    return true;
  }

  // Check if this is a property access to .children (from PropsWithChildren)
  // This must be checked BEFORE union recursion to avoid false positives
  if (ts.isPropertyAccessExpression(node) && node.name.text === 'children') {
    return true;
  }

  // Consolidated identifier checks - MUST be before union recursion
  if (ts.isIdentifier(node)) {
    // Destructured or direct `children` parameter (e.g., function Test({ children }: PropsWithChildren))
    if (node.text === 'children') {
      return true;
    }

    // Check if variable is initialized with JSX (e.g., const element = <div />)
    const symbol = checker.getSymbolAtLocation(node);
    if (symbol) {
      const declarations = symbol.getDeclarations();
      if (declarations) {
        for (const decl of declarations) {
          if (
            ts.isVariableDeclaration(decl) &&
            decl.initializer &&
            isJsx(ts, decl.initializer)
          ) {
            return true;
          }
        }
      }
    }
  }

  // Any type is never safe
  if (type.flags & ts.TypeFlags.Any) {
    return false;
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
      return true;
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
      return true;
    }
  }

  // Union types should be checked recursively
  if (type.isUnionOrIntersection()) {
    return type.types.every((innerType) => isSafeAttribute(ts, innerType, checker, node));
  }

  // For Array or Promise, we check the type of the first generic
  if (checker.isArrayType(type) || type.symbol?.escapedName === 'Promise') {
    return isSafeAttribute(ts, (type as any).resolvedTypeArguments?.[0], checker, node);
  }

  const text = node.getText();

  // manual unsafe variables should not pass
  if (text.startsWith('unsafe')) {
    return false;
  }

  // We allow literal string types here, as if they have XSS content,
  // the user has explicitly written it
  if (
    // Non string types cannot have XSS values
    !(type.flags & ts.TypeFlags.String) &&
    // Objects may have toString() overridden
    !(type.flags & ts.TypeFlags.Object)
  ) {
    return true;
  }

  if (
    // Variables starting with safe are suppressed
    text.startsWith('safe') ||
    // Starts with a call to a escapeHtml function name
    text.match(ESCAPE_HTML_REGEX)
  ) {
    return true;
  }

  return false;
}

export function getSafeAttribute(element: JsxOpeningElement) {
  for (const attribute of element.attributes.properties) {
    if (attribute.getText() === 'safe') {
      return attribute;
    }
  }

  return undefined;
}

export function proxyObject<T extends object>(obj: T): T {
  const proxy: T = Object.create(null);

  for (const k of Object.keys(obj) as Array<keyof T>) {
    const x = obj[k]!;
    // @ts-expect-error - JS runtime trickery which is tricky to type tersely
    proxy[k] = (...args: Array<{}>) => x.apply(obj, args);
  }

  return proxy;
}

/**
 * Returns more than one node if the node is a binary expression or a conditional
 * expression
 */
function getNodeExpressions(node: TS.Node): TS.Expression[] | undefined {
  // Checks operators
  if (ts.isBinaryExpression(node)) {
    // Ignores operations which results in a boolean
    if (isBooleanBinaryOperatorToken(node.operatorToken)) {
      return [];
    }

    // Diagnose both sides since both sides can be executed, e.g:
    // a empty string in the left side will execute the right side
    return [node.left, node.right];
  }

  // Checks the inner expression
  if (ts.isConditionalExpression(node)) {
    // ignore node.condition because its value will never be rendered
    return [node.whenFalse, node.whenFalse];
  }

  return undefined;
}

function isBooleanBinaryOperatorToken(operator: BinaryOperatorToken) {
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
      return true;
  }

  return false;
}
