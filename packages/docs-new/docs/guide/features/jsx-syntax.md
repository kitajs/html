# JSX Syntax

After all, JSX is just another way to write HTML. JSX is a syntax extension for JavaScript
that looks similar to XML.

Learning some syntax gotchas and how to extend types will make your life easier when
working with JSX.

## Learn JSX Basics

It's recommended to read the
[React JSX in depth](https://react.dev/learn/writing-markup-with-jsx) and
[Javascript in JSX with curly braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces)
articles from the Official React documentation.

## Fragments

JSX does not allow multiple root elements, but you can use a fragment to group multiple
elements:

```tsx
const html = (
  <>
    <div>1</div>
    <div>2</div>
  </>
);
```

[Learn more about JSX syntax here!](https://react.dev/learn/writing-markup-with-jsx)

## Supported HTML

All HTML elements and attributes should be supported.

- [Supported html elements](https://html.spec.whatwg.org/multipage#toc-semantics)
- [Supported html events](https://www.w3schools.com/tags/ref_eventattributes.asp)

**Missing an element or attribute?** Please create an issue or a PR to add it. It's easy
to add.

## The `tag` Tag

The `<tag of="">` tag is a custom internal tag that allows you to render any runtime
selected tag you want. Possible reasons to prefer this tag over extending types:

- You want to render a tag that is chosen at runtime
- You don't want to mess up with extending globally available types
- You are writing javascript with typechecking enabled
- You are writing a library and should not extend types globally
- You need to use kebab-case tags, which JSX syntax does not support

```tsx
<tag of="asd" />
// <asd></asd>

<tag of="my-custom-KEBAB" />
// <my-custom-KEBAB></my-custom-KEBAB>
```

We do recommend using [extending types](#extending-types) instead, as it will give you
intellisense and type checking.

## Conditional Classes

Kita supports constructing `class` attributes conditionally, which is a common use case
for many applications.

```tsx
<div class={['a', true && 'b', false && 'c', 'd']} />
// <div class="a b d"></div>

<div class={['class-a class-b', true && 'class-c']} />
// <div class="class-a class-b class-c"></div>
```

This behavior is pretty similar and inspired from [clsx](https://github.com/lukeed/clsx),
but we do not support objects as input.

## Extending Types

Just as exemplified above, you may also want to add custom properties to your elements.
You can do this by extending the `JSX` namespace.

```tsx
declare global {
  namespace JSX {
    // Adds a new element called mathPower
    interface IntrinsicElements {
      mathPower: HtmlTag & {
        // Changes properties to the math-power element
        ['my-exponential']: number;
        // this property becomes the <>{children}</> type
        children: number;
      };
    }

    // Adds hxBoost property to all elements native elements (those who extends HtmlTag)
    interface HtmlTag {
      ['hx-boost']: boolean;
      // TIP: We already provide HTMX types, check them out!
    }
  }
}

const element = (
  <mathPower my-exponential={2} hx-boost>
    {3}
  </mathPower>
);
// Becomes <math-power my-exponential="2" hx-boost>3</math-power>
```

## Allow Everything!

We also provide a way to allow any tag/attribute combination, although we **do not
recommend using it**.

Just add this triple slash directive to the top of your file:

```tsx
/// <reference types="@kitajs/html/all-types.d.ts" />
```

## How It Works

This package just aims to be a drop in replacement syntax for JSX, and it works because
you [tell tsc to transpile](/guide/getting-started#typescript-configuration) JSX syntax to
calls to our own JSX-runtime.

```tsx
<ol start={2}>
  {[1, 2].map((i) => (
    <li>{i}</li>
  ))}
</ol>
```

Gets transpiled by tsc to plain javascript:

```js
const runtime = require('@kitajs/html/jsx-runtime');

runtime.jsx('ol', {
  start: 2,
  children: [1, 2].map((i) => jsx('li', { children: i }))
});
```

Which, when called, returns this string:

```html
<ol start="2">
  <li>1</li>
  <li>2</li>
</ol>
```

## Format HTML Output

This package emits HTML as a compact string, useful for over the wire environments.
However, if your use case really needs the output HTML to be pretty printed, you can use
an external JS library to do so, like
[html-prettify](https://www.npmjs.com/package/html-prettify).

```tsx
import prettify from 'html-prettify';

const html = (
  <div>
    <div>1</div>
    <div>2</div>
  </div>
);

console.log(html);
// <div><div>1</div><div>2</div></div>

console.log(prettify(html));
// <div>
//   <div>1</div>
//   <div>2</div>
// </div>
```

## Serialization Table

Here is the table that explains how this library handles different types of children,
describing the inputs and outputs.

:::info Arrays are simply concatenated with no separator. :::

| Input Type                 | Output Type           |
| -------------------------- | --------------------- |
| `<div>{"abc"}</div>`       | `<div>abc</div>`      |
| `<div>{10}</div>`          | `<div>10</div>`       |
| `<div>{NaN}</div>`         | `<div>NaN</div>`      |
| `<div>{Infinity}</div>`    | `<div>Infinity</div>` |
| `<div>{true}</div>`        | `<div>true</div>`     |
| `<div>{false}</div>`       | `<div>false</div>`    |
| `<div>{null}</div>`        | `<div></div>`         |
| `<div>{undefined}</div>`   | `<div></div>`         |
| `<div>{[1, 2, 3]}</div>`   | `<div>123</div>`      |
| `<div>{BigInt(123)}</div>` | `<div>123</div>`      |

## Next Steps

- Learn about [Async Components](/guide/features/async-components)
- Explore [Integrations](/integrations/overview)
- Check out the [Benchmark](/guide/features/benchmark)
