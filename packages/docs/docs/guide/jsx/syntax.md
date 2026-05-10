---
description:
  Reference supported JSX features such as fragments, void elements, boolean attributes,
  styles, classes, and dynamic tags.
---

# Syntax

Kita Html uses standard JSX syntax. All HTML elements and attributes defined in the
[HTML specification](https://html.spec.whatwg.org/multipage#toc-semantics) are supported
with full TypeScript type checking.

## Fragments

Use fragments to return multiple elements without a wrapper.

```tsx twoslash kita
const html = (
  <>
    <div>First</div>
    <div>Second</div>
  </>
)
```

## Boolean attributes

When a boolean attribute is `true`, it renders as a valueless attribute. When `false`, it
is omitted entirely.

```tsx twoslash kita
const html = (
  <>
    <input disabled />
    <input disabled={true} />
    <input disabled={false} />
  </>
)
```

## Style attribute

The `style` attribute accepts both strings and objects. Object keys are converted from
camelCase to kebab-case automatically.

```tsx twoslash kita
const html = (
  <>
    <div style="color: red" />
    <div style={{ color: 'red', fontSize: '14px' }} />
  </>
)
```

## Class attribute

The `class` attribute also accepts an array.

Falsy values are filtered out and the remaining values are joined with spaces.

> This pattern is similar to [clsx](https://github.com/lukeed/clsx) but does not support
> objects.

```tsx twoslash kita
const isActive = false
const size = 'lg'
// ---cut---
const html = <div class={['base', isActive && 'active', size]} />
```

## The tag tag

The `<tag of="name">` element renders a tag whose name is determined at runtime. Use this
when the tag name is dynamic or when you need kebab-case tag names that JSX syntax does
not support.

```tsx twoslash kita
const html = (
  <tag of="My-custom-element" id="el">
    content
  </tag>
)
```

For tags known at compile time, prefer extending the JSX type system instead.

## Serialization

Different JavaScript types serialize differently when used as children.

| Expression     | Output  |
| -------------- | ------- |
| `{"abc"}`      | `abc`   |
| `{42}`         | `42`    |
| `{true}`       | `true`  |
| `{false}`      | `false` |
| `{null}`       | `''`    |
| `{undefined}`  | `''`    |
| `{[1, 2, 3]}`  | `123`   |
| `{BigInt(42)}` | `42`    |

Arrays are concatenated with no separator. `null` and `undefined` produce no output.
Booleans render as their string representation, unlike React which suppresses `true` and
`false`.

## Void elements

Self-closing elements like `<br />`, `<img />`, `<input />`, and `<meta />` do not produce
a closing tag. The runtime detects void elements by tag name.

## Missing elements or attributes

If an HTML element or attribute is missing from the type definitions, open a pull request
adding it. See the
[contributing guide](https://github.com/kitajs/html/blob/master/CONTRIBUTING.md) for setup
instructions.
