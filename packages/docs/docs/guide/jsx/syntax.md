---
description:
  Reference supported JSX features such as fragments, void elements, boolean attributes,
  styles, classes, and dynamic tags.
---

# JSX Syntax

Kita Html uses standard JSX syntax. All HTML elements and attributes defined in the
[HTML specification](https://html.spec.whatwg.org/multipage#toc-semantics) are supported
with full TypeScript type checking.

## Fragments

Use fragments to return multiple elements without a wrapper.

```tsx
const html = (
  <>
    <div>First</div>
    <div>Second</div>
  </>
)
// '<div>First</div><div>Second</div>'
```

## Void elements

Self-closing elements like `<br />`, `<img />`, `<input />`, and `<meta />` do not produce
a closing tag. The runtime detects void elements by tag name.

## Boolean attributes

When a boolean attribute is `true`, it renders as a valueless attribute. When `false`, it
is omitted entirely.

```tsx
<input disabled={true} />
// '<input disabled>'

<input disabled={false} />
// '<input>'
```

## Style attribute

The `style` attribute accepts both strings and objects. Object keys are converted from
camelCase to kebab-case automatically.

```tsx
<div style="color: red" />
<div style={{ color: 'red', fontSize: '14px' }} />
// Both: '<div style="color:red;font-size:14px"></div>'
```

## Conditional classes

The `class` attribute accepts an array. Falsy values are filtered out and the remaining
values are joined with spaces. This pattern is similar to
[clsx](https://github.com/lukeed/clsx) but does not support objects.

```tsx
<div class={['base', isActive && 'active', size]} />
// If isActive is false and size is 'lg':
// '<div class="base lg"></div>'
```

## The tag tag

The `<tag of="name">` element renders a tag whose name is determined at runtime. Use this
when the tag name is dynamic or when you need kebab-case tag names that JSX syntax does
not support.

```tsx
<tag of="my-custom-element" id="el">
  content
</tag>
// '<my-custom-element id="el">content</my-custom-element>'
```

For tags known at compile time, prefer extending the JSX type system instead.

## Serialization

Different JavaScript types serialize differently when used as children.

| Expression     | Output    |
| -------------- | --------- |
| `{"abc"}`      | `abc`     |
| `{42}`         | `42`      |
| `{true}`       | `true`    |
| `{false}`      | `false`   |
| `{null}`       | _(empty)_ |
| `{undefined}`  | _(empty)_ |
| `{[1, 2, 3]}`  | `123`     |
| `{BigInt(42)}` | `42`      |

Arrays are concatenated with no separator. `null` and `undefined` produce no output.
Booleans render as their string representation, unlike React which suppresses `true` and
`false`.

## Missing elements or attributes

If an HTML element or attribute is missing from the type definitions, open a pull request
adding it. See the
[contributing guide](https://github.com/kitajs/html/blob/master/CONTRIBUTING.md) for setup
instructions.
