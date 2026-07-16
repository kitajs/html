---
description:
  Extend JSX.IntrinsicElements and HtmlTag to support custom elements, custom attributes,
  or unrestricted tags.
---

# Extending Types

Kita Html's type system can be extended to support custom elements, custom attributes, or
both.

## Custom elements

Declare new entries in `JSX.IntrinsicElements` to add custom HTML elements with typed
attributes.

```tsx twoslash kita
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'user-card': HtmlTag & {
        'user-id': number
        children: string
      }
    }
  }
}

const html = <user-card user-id={42}>Arthur</user-card>
```

::: warning Capitalized tags are components

JSX interprets capitalized tags as components. Use lowercase custom element names for
intrinsic elements. When the tag name cannot be written directly in JSX, use
[`<tag of="...">`](/guide/jsx/syntax#the-tag-tag) instead.

```tsx twoslash
// @errors: 2304
declare global {
  namespace JSX {
    interface IntrinsicElements {
      Example: HtmlTag
    }
  }
}

const html = <Example />
```

:::

## Custom attributes on all elements

Extend the `HtmlTag` interface to add attributes to every native HTML element.

```tsx twoslash kita
declare global {
  namespace JSX {
    interface HtmlTag {
      'data-testid'?: string
    }
  }
}

const html = <div data-testid="header">content</div>
```

## Allow any tag and attribute

If you need to bypass type checking entirely, add a triple-slash directive to your
`src/kita.d.ts` file. This is not recommended for production code.

Without the unrestricted type extension, unknown tags are rejected:

```tsx twoslash
// @errors: 2339
const html = <myrandomtag myrandom-attribute="value" />
```

Add `@kitajs/html/all-types` to allow any tag and attribute:

```tsx twoslash kita
/// <reference types="@kitajs/html/all-types" />

const html = <myrandomtag myrandom-attribute="value" />
```
