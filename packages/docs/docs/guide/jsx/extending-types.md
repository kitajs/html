---
description:
  Extend JSX.IntrinsicElements and HtmlTag to support custom elements, custom attributes,
  or unrestricted tags.
---

# Extending types

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
[`<tag of="...">`](/guide/jsx/syntax#the-tag-element) instead.

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

## Any custom element

Web component libraries such as MDUI or Shoelace ship many tags. Instead of declaring each
one, add `@kitajs/html/custom-elements` to your `src/kita.d.ts` file. Every tag name that
contains a dash, as the HTML spec requires for custom elements, becomes valid and accepts
any attribute.

```tsx twoslash kita
/// <reference types="@kitajs/html/custom-elements" />

const html = (
  <mdui-button variant="filled" end-icon="arrow_back" onclick="history.back()">
    Back
  </mdui-button>
)
```

Tags without a dash are still rejected. Elements declared in `JSX.IntrinsicElements`, like
`user-card` above, keep their own attribute types.

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
