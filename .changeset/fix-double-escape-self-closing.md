---
'@kitajs/ts-html-plugin': patch
---

Fix double escape detection for self-closing components and JSX in expressions

The TS88602 DoubleEscape error was not being triggered for self-closing components like
`<UserBadge />` when used as direct children of elements with the `safe` attribute, or
when used within expressions (ternary operators, binary operators).

This fix ensures that all JSX types (elements with opening/closing tags, self-closing
elements, and fragments) are properly detected in both direct children and expression
contexts, preventing double-escaped HTML output that would corrupt markup.
