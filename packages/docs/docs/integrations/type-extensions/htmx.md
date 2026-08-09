---
description:
  Enable typed HTMX attributes in Kita Html with a triple-slash reference and use hx-get,
  hx-post, and hx-swap in JSX.
---

# HTMX

Kita Html provides type definitions for all [HTMX](https://htmx.org/) attributes. Once
enabled, attributes like `hx-get`, `hx-post`, `hx-trigger`, `hx-target`, and `hx-swap` are
available on all HTML elements with full autocomplete.

## Setup

Create a `src/kita.d.ts` file in your project and add the triple-slash directive:

```ts title="src/kita.d.ts"
/// <reference types="@kitajs/html/htmx.d.ts" />
```

## Usage

```tsx
<button hx-post="/api/click" hx-target="#count" hx-swap="innerHTML">
  Click me
</button>

<div id="count">0</div>
```

All standard HTMX attributes are typed, including `hx-trigger` event specifications,
`hx-swap` modifiers, and extension attributes like `hx-ext`.
