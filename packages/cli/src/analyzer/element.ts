import type {
  Expression,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement
} from 'typescript/ast'
import * as Errors from '../errors.js'
import { report, type AnalyzerContext } from './context.js'
import { isSafeAttribute } from './safety.js'
import {
  ESCAPE_HTML_REGEX,
  getNodeExpressions,
  getSafeAttribute,
  isJsx,
  UPPERCASE
} from './syntax.js'

export function diagnoseJsxElement(
  ctx: AnalyzerContext,
  node: JsxElement | JsxFragment | JsxSelfClosingElement
): void {
  const { ts, checker, sourceFile } = ctx

  // Validations that does not applies to fragments or self closing elements
  if (ts.is.isJsxElement(node)) {
    // Script tags should be ignored
    if (node.openingElement.tagName.getText(sourceFile) === 'script') {
      return
    }

    const safeAttribute = getSafeAttribute(node.openingElement)

    // Safe mode warnings
    if (safeAttribute && node.children) {
      if (
        // Empty element
        node.children.length === 0 ||
        // Only text elements
        (node.children.length === 1 && ts.is.isJsxText(node.children[0]!))
      ) {
        report(ctx, safeAttribute, Errors.UnusedSafe, 'warning')
        return
      }

      for (const exp of node.children) {
        if (
          // JSX Element inside safe (includes self-closing elements like <Component />)
          isJsx(ts, exp) ||
          // Element is using safe with escapeHtml
          (ts.is.isJsxExpression(exp) &&
            exp.expression &&
            ESCAPE_HTML_REGEX.test(exp.expression.getText(sourceFile)))
        ) {
          report(ctx, safeAttribute, Errors.DoubleEscape, 'error')
          continue
        }

        // Warn on unnecessary safe attributes
        if (
          ts.is.isJsxExpression(exp) &&
          // has inner expression
          exp.expression
        ) {
          // gets this expression or array of sub expressions
          const expressions = getNodeExpressions(ts, exp.expression) || [exp.expression]

          // at least one jsx inside another jsx with safe (includes self-closing elements)
          if (expressions.some((inner) => isJsx(ts, inner))) {
            report(ctx, safeAttribute, Errors.DoubleEscape, 'error')
            continue
          }

          // all of them must be safe
          if (
            expressions.every((inner) =>
              isSafeAttribute(ctx, checker.getTypeAtLocation(inner), inner)
            )
          ) {
            report(ctx, safeAttribute, Errors.UnusedSafe, 'warning')
          }
        }
      }

      return
    }
  }

  // If this expression does not have children, we can ignore it
  // for example it could be a self closing element
  if (ts.is.isJsxSelfClosingElement(node) || !node.children) {
    return
  }

  const isComponent =
    ts.is.isJsxElement(node) &&
    UPPERCASE.test(node.openingElement.tagName.getText(sourceFile))

  // Look for expressions
  for (const exp of node.children) {
    if (!ts.is.isJsxExpression(exp)) {
      continue
    }

    // Should always have an expression
    if (!exp.expression) {
      continue
    }

    diagnoseExpression(ctx, exp.expression, isComponent)
  }
}

function diagnoseExpression(
  ctx: AnalyzerContext,
  node: Expression,
  isComponent: boolean
): void {
  const { ts, checker, sourceFile } = ctx

  // Unwrap parenthesis
  while (ts.is.isParenthesizedExpression(node)) {
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
      diagnoseExpression(ctx, inner, isComponent)
    }

    return
  }

  const type = checker.getTypeAtLocation(node)

  // Safe can be ignored
  if (isSafeAttribute(ctx, type, node)) {
    return
  }

  // Anything other than a identifier should be diagnosed
  if (!ts.is.isIdentifier(node)) {
    let hadJsx = false

    for (const tag of node.getChildren(sourceFile)) {
      if (!isJsx(ts, tag)) {
        continue
      }

      hadJsx = true

      diagnoseJsxElement(ctx, tag)
    }

    // If root JSX element found inside array, diagnose it,
    // otherwise let the diagnostic pass
    if (hadJsx) {
      return
    }
  }

  // Switch between component and element xss errors
  if (isComponent || ts.is.isJsxFragment(node)) {
    report(ctx, node, Errors.ComponentXss, 'error')
  } else {
    report(ctx, node, Errors.Xss, 'error')
  }
}
