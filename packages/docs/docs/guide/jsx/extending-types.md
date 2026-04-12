# Extending JSX Types

Kita Html's type system can be extended to support custom elements, custom attributes, or
both.

## Custom elements

Declare new entries in `JSX.IntrinsicElements` to add custom HTML elements with typed
attributes.

```tsx
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-power': HtmlTag & {
        exponent: number
        children: number
      }
    }
  }
}

;<math-power exponent={2}>{3}</math-power>
// '<math-power exponent="2">3</math-power>'
```

## Custom attributes on all elements

Extend the `HtmlTag` interface to add attributes to every native HTML element.

```tsx
declare global {
  namespace JSX {
    interface HtmlTag {
      'data-testid'?: string
    }
  }
}

;<div data-testid="header">content</div>
```

## Allow any tag and attribute

If you need to bypass type checking entirely, add a triple-slash directive to your
`src/kita.d.ts` file. This is not recommended for production code.

```ts title="src/kita.d.ts"
/// <reference types="@kitajs/html/all-types.d.ts" />
```

Or add it globally in `tsconfig.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "types": ["@kitajs/html/all-types.d.ts"]
  }
}
```
