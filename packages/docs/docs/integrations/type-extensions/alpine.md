# Alpine.js

Kita Html provides type definitions for [Alpine.js](https://alpinejs.dev/) directives.
Once enabled, attributes like `x-data`, `x-show`, `x-on`, and `x-text` are available on
all HTML elements with autocomplete.

## Setup

Create a `src/kita.d.ts` file in your project and add the triple-slash directive. If you
already have this file for another type extension, append the new directive to it.

```ts title="src/kita.d.ts"
/// <reference types="@kitajs/html/alpine.d.ts" />
```

Or enable it globally in `tsconfig.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "types": ["@kitajs/html/alpine.d.ts"]
  }
}
```

## Usage

```tsx
<div x-data="{ open: false }">
  <button x-on:click="open = !open">Toggle</button>
  <div x-show="open">Content</div>
</div>
```

## Combining with other extensions

Add multiple directives to the same `src/kita.d.ts` file:

```ts title="src/kita.d.ts"
/// <reference types="@kitajs/html/htmx.d.ts" />
/// <reference types="@kitajs/html/alpine.d.ts" />
```
