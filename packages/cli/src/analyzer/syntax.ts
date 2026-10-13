import type {
  BinaryOperatorToken,
  Expression,
  JsxAttributeLike,
  JsxElement,
  JsxFragment,
  JsxOpeningElement,
  JsxSelfClosingElement,
  Node
} from 'typescript/ast'
import type { TypeScript } from '../typescript.js'

export const UPPERCASE = /[A-Z]/
export const ESCAPE_HTML_REGEX = /^(\w+\.)?((escapeHtml|escape)(<[^(`]*>)?\s*[(`]|e\s*`)/i
export const SAFE_PREFIX_REGEX = /^safe($|[^a-z])/

/** If the node is a JSX element or fragment */
export function isJsx(
  ts: TypeScript,
  node: Node
): node is JsxElement | JsxFragment | JsxSelfClosingElement {
  return (
    ts.is.isJsxElement(node) ||
    ts.is.isJsxFragment(node) ||
    ts.is.isJsxSelfClosingElement(node)
  )
}

export function getSafeAttribute(
  element: JsxOpeningElement
): JsxAttributeLike | undefined {
  for (const attribute of element.attributes.properties) {
    if (attribute.getText() === 'safe') {
      return attribute
    }
  }

  return undefined
}

/**
 * Returns more than one node if the node is a binary expression or a conditional
 * expression
 */
export function getNodeExpressions(
  ts: TypeScript,
  node: Expression
): Expression[] | undefined {
  // Checks operators
  if (ts.is.isBinaryExpression(node)) {
    // Ignores operations which results in a boolean
    if (isBooleanBinaryOperatorToken(ts, node.operatorToken)) {
      return []
    }

    // For && operator, the left side is only rendered when falsy
    // (empty string, null, undefined, 0, false, NaN) - none of which are XSS risks
    // So we only need to diagnose the right side
    if (node.operatorToken.kind === ts.ast.SyntaxKind.AmpersandAmpersandToken) {
      return [node.right]
    }

    // For || and ?? operators, both sides can be rendered with potentially unsafe values
    // So we diagnose both sides
    return [node.left, node.right]
  }

  // Checks the inner expression
  if (ts.is.isConditionalExpression(node)) {
    // ignore node.condition because its value will never be rendered
    return [node.whenTrue, node.whenFalse]
  }

  return undefined
}

function isBooleanBinaryOperatorToken(ts: TypeScript, operator: BinaryOperatorToken) {
  const { SyntaxKind } = ts.ast

  switch (operator.kind) {
    case SyntaxKind.EqualsEqualsEqualsToken:
    case SyntaxKind.EqualsEqualsToken:
    case SyntaxKind.ExclamationEqualsEqualsToken:
    case SyntaxKind.ExclamationEqualsToken:
    case SyntaxKind.GreaterThanToken:
    case SyntaxKind.GreaterThanEqualsToken:
    case SyntaxKind.LessThanEqualsToken:
    case SyntaxKind.LessThanToken:
    case SyntaxKind.InstanceOfKeyword:
    case SyntaxKind.InKeyword:
      return true
  }

  return false
}
