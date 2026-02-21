# XSS Analysis

The XSS analysis engine inspects JSX expressions at the TypeScript type level and emits
diagnostics for potentially unsafe content. This engine is shared between the editor
plugin and the CLI scanner.

## Analysis functions

### recursiveDiagnoseJsxElements

Entry point for JSX tree analysis. Walks the AST depth-first and calls
`diagnoseJsxElement` for each JSX node. Deduplicates diagnostics by source position.

### diagnoseJsxElement

Analyzes a single JSX element. Checks whether the element has the `safe` attribute,
iterates through JSX expression children, and delegates to `diagnoseExpression` for each.

Skips `<script>` elements, which are exempt from analysis.

### diagnoseExpression

Analyzes a single expression within JSX children. Unwraps parenthesized expressions,
recurses through ternary and binary expressions (checking both branches), and calls
`isSafeAttribute` to determine type safety.

### isSafeAttribute

The core type safety check. Returns `true` if the expression's TypeScript type is safe to
render without escaping. The full rule set is documented in the
[Safety Rules](/guide/xss/safety-rules) page.

## Diagnostic codes

The engine emits four diagnostic codes: K601 (unsafe expression), K602 (double escaping),
K603 (component children XSS), and K604 (unnecessary safe). Full descriptions with
examples are in the [Error Codes](/guide/xss/error-codes) page.

## Component vs element detection

The engine distinguishes native elements from components based on tag name casing.
Lowercase names are native elements where the `safe` attribute works. Uppercase names are
components where `Html.escapeHtml()` is required instead.
