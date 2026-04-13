---
description:
  See which TypeScript types the XSS engine treats as safe, unsafe, composite, or exempt
  inside JSX children.
---

# Safety Rules

The XSS detection engine classifies every JSX child expression as safe or unsafe based on
its TypeScript type. This page lists the rules the engine follows.

## Safe types

Expressions with these types render without escaping and produce no diagnostic:

- `number`, `boolean`, `bigint`, `null`, `undefined`
- String literals (e.g. `'hello'` rather than `string`)
- `JSX.Element` (the output of another component, already rendered)
- `Html.Children` (the typed children alias)
- Return values of `Html.escapeHtml()`, `Html.escape()`, or `e` template literals
- Variables whose name starts with `safe` (e.g. `safeContent`, `safeHtml`)

## Unsafe types

Expressions with these types trigger a diagnostic unless wrapped with `safe` or escaped
manually:

- `string` (a dynamic string that could contain HTML)
- `any` (the engine cannot verify safety without a concrete type)
- Objects relying on `toString()` for rendering

## Composite types

Union types are safe only if every member of the union is safe. `string | number` is
unsafe because `string` is unsafe. `number | boolean` is safe because both members are
safe.

Both branches of ternary and binary expressions are checked independently. Even if one
branch is unreachable at runtime, the engine still analyzes its type.

```tsx twoslash
// @errors: 88601
const condition = true
const safeValue = 42
const unsafeString = 'user input'

;<div>{condition ? safeValue : unsafeString}</div>
```

## Exceptions

Content inside `<script>` elements is exempt from analysis. Script content is intended to
be executable and is not subject to HTML escaping rules.
