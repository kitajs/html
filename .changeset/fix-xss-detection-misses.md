---
'@kitajs/ts-html-plugin': patch
---

Fix XSS detection misses for string-like types, `children` names, reassigned JSX variables
and lookalike suppression names

The scanner previously stayed silent on several patterns that render raw HTML at runtime:

- Identifiers named `children` and `.children` property accesses were always treated as
  `PropsWithChildren`, even when typed as `string` or `any`. They are now only trusted
  when the type is not user content (raw strings, unions/tuples/arrays of raw strings, or
  thenables resolving to raw strings like `children?: string` or
  `children: Promise<string>`).
- Generic type parameters (`T extends string`), template literal types
  (`` `<b>${string}</b>` ``), intrinsic string mappings (`Uppercase<string>`), unresolved
  conditional/indexed access types and `unknown` were treated as non-string primitives.
  They are now resolved through their constraint/inner types, and `unknown` is never safe,
  matching `any`.
- Variables initialized with JSX were trusted forever. They are now only safe while their
  use-site type stays JSX-ish and they were not reassigned to user content in the same
  scope (writes inside nested functions are ignored since deferred callbacks run after
  rendering).
- Suppression names were over-matched: `safetyRating`, `escaped` and functions like
  `escapeRoom()` no longer suppress diagnostics. `safe`-prefixed names now require a
  camelCase boundary, only `escapeHtml()`/`escape()` calls and the ` e`
  ``template tag count as escapers, and`as 'safe'` is the only accepted literal cast.
