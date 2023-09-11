<br />

[![Issues](https://img.shields.io/github/issues/kitajs/html?logo=github&label=Issues)](https://github.com/kitajs/html/issues)
[![Stars](https://img.shields.io/github/stars/kitajs/html?logo=github&label=Stars)](https://github.com/kitajs/html/stargazers)
[![License](https://img.shields.io/github/license/kitajs/html?logo=githu&label=License)](https://github.com/kitajs/html/blob/master/LICENSE)
[![Speed Blazing](https://img.shields.io/badge/speed-blazing%20%F0%9F%94%A5-brightgreen.svg)](https://twitter.com/acdlite/status/974390255393505280)

[![Latest Version](https://img.shields.io/npm/v/@kitajs/html)](https://www.npmjs.com/package/@kitajs/html)
[![Downloads](https://img.shields.io/npm/dw/@kitajs/html)](https://www.npmjs.com/package/@kitajs/html)
[![JsDelivr](https://data.jsdelivr.com/v1/package/npm/@kitajs/html/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@kitajs/html)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/@kitajs/html/latest?style=flat)](https://bundlephobia.com/package/@kitajs/html@latest)
[![Packagephobia](https://packagephobia.com/badge?p=@kitajs/html@latest)](https://packagephobia.com/result?p=@kitajs/html@latest)

<br />

<div align="center">
  <pre>
  <h1>🏛️<br />KitaJS Html</h1>
  </pre>
  <br />
</div>

<h3 align="center">
  <code>@kitajs/html</code> is a no dependencies, fast and concise package to generate HTML through JavaScript with JSX syntax.
  <br />
  <br />
</h3>

<br />

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installing](#installing)
- [Getting Started](#getting-started)
- [Sanitization](#sanitization)
  - [The safe attribute](#the-safe-attribute)
- [Migrating from HTML](#migrating-from-html)
  - [Base HTML templates](#base-html-templates)
- [Compiling HTML](#compiling-html)
  - [Clean Components](#clean-components)
- [Fragments](#fragments)
- [Supported HTML](#supported-html)
  - [The `tag` tag](#the-tag-tag)
- [Async Components](#async-components)
- [Extending types](#extending-types)
- [Performance](#performance)
- [How it works](#how-it-works)
- [Format HTML output](#format-html-output)
- [Fork credits](#fork-credits)

<br />

## Installing

```sh
npm install @kitajs/html # or yarn add @kitajs/html
```

<br />

## Getting Started

Install `@kitajs/html` with your favorite package manager, import it into the top of your `jsx`/`tsx` file and change your tsconfig.json to transpile jsx syntax.

```js
// tsconfig.json

{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "Html.createElement",
    "jsxFragmentFactory": "Html.Fragment"
  }
}
```

```jsx
// Unique import to the top of your main.ts file.
import '@kitajs/html/register'
// Or import it directly everywhere you need it.
import Html from '@kitajs/html'

// Using as a simple html builder
console.log(<div>Hello World</div>) // '<div>Hello World</div>'

// Maybe your own server-side html frontend
function route(request, response) {
  return response
    .header('Content-Type', 'text/html')
    .send(<div>Hello World</div>)
}

// What about generating a static html file?
fs.writeFileSync(
  'index.html',
  <html>
    <head>
      <title>Hello World</title>
    </head>
    <body>
      <div>Hello World</div>
    </body>
  </html>
)

// Also as a component library
function Layout({ name, children }: Html.PropsWithChildren<{ name: string }>) {
  return (
    <html>
      <head>
        <title>Hello World</title>
      </head>
      <body>
        <div>Hello {name}</div>
        {children}
      </body>
    </html>
  )
}

console.log(<Layout name="World">I'm in the body!</Layout>)

// Anywhere you want! All JSX becomes a string
typeof (<div>Hello World</div>) === 'string'
```

This package just provides functions to transpile JSX to a HTML string, you can imagine doing something like this before, but now with type checking and intellisense:

```ts
// without @kitajs/html
const html = `<div> Hello World!<div>` ❌
```

```jsx
// with @kitajs/html
const html = <div>Hello World!<div> ✅
// Also results into a string, but with type checks.
```

<br />

## Sanitization

This package aims to be a HTML builder, **_not an HTML sanitizer_**. This means that no HTML content is escaped by default. However we provide a custom attribute called **_`safe`_** that will sanitize everything inside of it. You can also use the exported `Html.escapeHtml` function to escape other contents arbitrarily.

```jsx
// Attributes are always escaped by default
<div style={'"&<>\''}></div> // <div style="&#34;&amp;&lt;&gt;&#39;"></div>
<div style={{ backgroundColor: '"&<>\'' }}></div> // <div style="background-color:&#34;&amp;&lt;&gt;&#39;;"></div>
```

```jsx
// Correct way to escape input content, you should only use when rendering user input
<div safe>{untrusted}</div> // <div>&lt;script&gt;alert(&#34;hacked!&#34;)&lt;/script&gt;</div>
```

```jsx
// Manual escaping with Html.escapeHtml
<div>{'<a></a>' + Html.escapeHtml('<a></a>')}</div> // <div><a></a>&lt;a&gt;&lt;/a&gt;</div>
```

```jsx
// ⚠️ unsafe input is not escaped by default
<div>{untrusted}</div> // <div><script>alert('hacked!')</script></div>
```

It's like if React's `dangerouslySetInnerHTML` was enabled by default.

<br />

### The safe attribute

You should always use the `safe` attribute when you are rendering user input. This will sanitize its contents and avoid XSS attacks.

```jsx
function UserCard({ name, description, date, about }) {
  return (
    <div class="card">
      <h1 safe>{name}</h1>
      <br />
      <p safe>{description}</p>
      <br />
      // controlled input, no need to sanitize
      <time datetime={date.toISOString()}>{date.toDateString()}</time>
      <br />
      <p safe>{about}</p>
    </div>
  )
}
```

Note that only at the very bottom of the HTML tree is where you should use the `safe` attribute, to only escape where its needed.

👉 There's an open issue to integrate this within a typescript plugin to emit warnings and alerts to use the safe attribute everywhere a variable is used. Wanna help? Check [this issue](https://github.com/kitajs/html/issues/2).

<br />

## Migrating from HTML

Migrating from plain HTML to JSX can be a pain to convert it all manually, as you will find yourself hand placing quotes and closing void elements. Luckily for us, there's a tool called [htmltojsx](https://magic.reactjs.net/htmltojsx.htm) that can help us with that.

```html
<!-- Hello world -->
<div class="awesome" style="border: 1px solid red">
  <label for="name">Enter your name: </label>
  <input type="text" id="name" />
</div>
<p>Enter your HTML here</p>
```

Generates:

```jsx
<>
  {/* Hello world */}
  <div className="awesome" style={{ border: '1px solid red' }}>
    <label htmlFor="name">Enter your name: </label>
    <input type="text" id="name" />
  </div>
  <p>Enter your HTML here</p>
</>
```

<br />

### Base HTML templates

Often you will have a "template" html with doctype, things on the head, body and so on... The layout is also a very good component to be compiled. Here is a effective example on how to do it:.

```tsx
export const Layout = html.compile(
  (p: Html.PropsWithChildren<{ head: string }>) => (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Document</title>
          {p.head}
        </head>
        <body>{p.children}</body>
      </html>
    </>
  )
)

const html = (
  <Layout
    head={
      <>
        <link rel="stylesheet" href="/style.css" />
        <script src="/script.js" />
      </>
    }>
    <div>Hello World</div>
  </Layout>
)
```

<br />

## Compiling HTML

Compiles a **clean component** into a super fast component. This does not
support unclean components / props processing.

This mode works just like prepared statements in SQL. Compiled components can give up to [**2000**](#performance) times faster html generation. This is a opt-in feature that you may not be able to use everywhere!

```tsx
import Html from '@kitajs/html'

function Component(props: Html.PropsWithChildren<{ name: string }>) {
  return <div>Hello {props.name}</div>
}

const compiled = Html.compile<typeof Component>(Component)

compiled({ name: 'World' })
// <div>Hello World</div>

const compiled = Html.compile((p) => <div>Hello {p.name}</div>)

compiled({ name: 'World' })
// <div>Hello World</div>
```

Properties passed for compiled components **ARE NOT** what will be passed as argument to the generated function.

```tsx
const compiled = Html.compile((t) => {
  // THIS WILL NOT print 123, but a string used by .compile instead
  console.log(t.asd)
  return <div></div>
})

compiled({ asd: 123 })
```

That's the reason on why you cannot compile unclean components, as they need to process the props before rendering.

<br />

### Clean Components

A **clean component** is a component that does not process props before
applying them to the element. This means that the props are applied to the
element as is, and you need to process them before passing them to the
component.

```tsx
// Clean component, render as is
function Clean(props: CleanProps<{ repeated: string }>) {
  return <div>{props.repeated}</div>
}

// Calculation is done before passing to the component
html = <Clean name={'a'.repeat(5)} />

// Unclean component, process before render
function Unclean(props: { repeat: string; n: number }) {
  return <div>{props.repeat.repeat(props.n)}</div>
}

// Calculation is done inside the component, thus cannot be used with .compile()
html = <Unclean repeat="a" n={5} />
```

<br />

## Fragments

JSX does not allow multiple root elements, but you can use a fragment to group multiple elements:

```jsx
const html = (
  <>
    <div>1</div>
    <div>2</div>
  </>
)
```

[Learn more about JSX syntax here!](https://react.dev/learn/writing-markup-with-jsx)

<br />

## Supported HTML

All HTML elements and attributes should be supported.

- [Supported html elements](https://html.spec.whatwg.org/multipage#toc-semantics)
- [Supported html events](https://www.w3schools.com/tags/ref_eventattributes.asp)

**Missing an element or attribute?** Please create an issue or a PR to add it. It's easy to add.

<br />

### The `tag` tag

The `<tag of="">` tag is a custom internal tag that allows you to render any runtime selected tag you want. Possibly reasons to prefer this tag over extending types:

- You want to render a tag that is chosen at runtime.
- You don't want to mess up with extending globally available types.
- You are writing javascript with typechecking enabled.
- You are writing a library and should not extend types globally.
- You need to use kebab-case tags, which JSX syntax does not support.

```jsx
<tag of="asd" />
// <asd></asd>

<tag of="my-custom-KEBAB" />
// <my-custom-KEBAB></my-custom-KEBAB>
```

We do recommend using [extending types](#extending-types) instead, as it will give you intellisense and type checking.

<br />

## Async Components

Sadly, we cannot allow async components in JSX and keep the same string type for everything else. Even though it should be possible to write async components you will have no real benefit from it, as you will always have to await the whole html generation
to complete before you can render it.

You should fetch async data in the following way:

```jsx
// Fetches all async code beforehand and passes its contents to the component.
async function render(name) {
  const data = await api.data(name)
  const otherData = await api.otherData(name)

  return <Layout data={data} otherData={data} />
}
```

<br />

## Extending types

Just as exemplified above, you may also want to add custom properties to your elements. You can do this by extending the `JSX` namespace.

> ⚠️ Please follow the JSX convention and do not use `kebab-case` for your properties, use `camelCase` instead. We internally transform all `camelCase` properties to `kebab-case` to be compliant with the HTML and JSX standards.

```tsx
declare global {
  namespace JSX {
    // Adds a new element called mathPower
    interface IntrinsicElements {
      mathPower: HtmlTag & {
        // Changes properties to the math-power element
        myExponential: number
        // this property becomes the <>{children}</> type
        children: number
      }
    }

    // Adds hxBoost property to all elements native elements (those who extends HtmlTag)
    interface HtmlTag {
      hxBoost: boolean
    }
  }
}

const element = (
  <mathPower myExponential={2} hxBoost>
    {3}
  </mathPower>
)
// Becomes <math-power my-exponential="2" hx-boost>3</math-power>
```

<br />

## Performance

This package is just a string builder on steroids, as you can see [how this works](#how-it-works). This means that most way to isolate performance differences is to micro benchmark.

You can run this yourself by running `pnpm bench`. The bench below was with a Apple M1 Pro 8gb.

```markdown
# Benchmark

- 2023-09-11T06:33:17.036Z
- Node: v20.6.0
- V8: 10.2.154.26-node.26
- OS: darwin
- Arch: arm64

## Hello World

| Runs   | @kitajs/html | typed-html | +     | .compile() | + / @kitajs/html | + / typed-html |
| ------ | ------------ | ---------- | ----- | ---------- | ---------------- | -------------- |
| 10     | 0.0111ms     | 0.0149ms   | 1.34x | 0.0071ms   | 1.56x            | 2.1x           |
| 10000  | 1.389ms      | 4.3509ms   | 3.13x | 0.5962ms   | 2.33x            | 7.3x           |
| 100000 | 9.6386ms     | 25.7452ms  | 2.67x | 2.6383ms   | 3.65x            | 9.76x          |

## Many Props

| Runs   | @kitajs/html | typed-html   | +     | .compile() | + / @kitajs/html | + / typed-html |
| ------ | ------------ | ------------ | ----- | ---------- | ---------------- | -------------- |
| 10     | 0.8359ms     | 2.4209ms     | 2.9x  | 0.0041ms   | 203.88x          | 590.46x        |
| 10000  | 654.4648ms   | 1696.169ms   | 2.59x | 1.0713ms   | 610.91x          | 1583.28x       |
| 100000 | 6022.4039ms  | 13676.7311ms | 2.27x | 4.9011ms   | 1228.79x         | 2790.54x       |

## Big Component

| Runs   | @kitajs/html | typed-html  | +     | .compile() | + / @kitajs/html | + / typed-html |
| ------ | ------------ | ----------- | ----- | ---------- | ---------------- | -------------- |
| 10     | 0.4776ms     | 1.0979ms    | 2.3x  | 0.0052ms   | 91.85x           | 211.13x        |
| 10000  | 411.6375ms   | 987.0599ms  | 2.4x  | 1.2778ms   | 322.15x          | 772.47x        |
| 100000 | 3986.7891ms  | 9863.4924ms | 2.47x | 6.9333ms   | 575.02x          | 1422.63x       |
```

<br />

## How it works

This package just aims to be a drop in replacement syntax for JSX, and it works because you [tell tsc to transpile](#getting-started) JSX syntax to calls to our own `html` namespace.

```jsx
<ol start={2}>
  {[1, 2].map((i) => (
    <li>{i}</li>
  ))}
</ol>
```

Gets transpiled by tsc to plain javascript:

```js
Html.createElement(
  'ol',
  { start: 2 },
  [1, 2].map((i) => Html.createElement('li', null, i))
)
```

Which, when called, returns this string:

```js
'<ol start="2"><li>1</li><li>2</li></ol>'
```

<br />

## Format HTML output

This package emits HTML as a compact string, useful for over the wire environments. However, if your use case really needs the output
HTML to be pretty printed, you can use an external JS library to do so, like [html-prettify](https://www.npmjs.com/package/html-prettify).

```jsx
import Html from '@kitajs/html'
import prettify from 'html-prettify'

const html = (
  <div>
    <div>1</div>
    <div>2</div>
  </div>
)

console.log(html)
// <div><div>1</div><div>2</div></div>

console.log(prettify(html))
// <div>
//   <div>1</div>
//   <div>2</div>
// </div>
```

👉 There's an open PR to implement this feature natively, wanna work on it? Check [this PR](https://github.com/kitajs/html/pull/1).

<br />

## Fork credits

This repository was initially forked from [typed-html](https://github.com/nicojs/typed-html) and modified to add some features and increase performance.

Initial credits to [nicojs](https://github.com/nicojs) and [contributors](https://github.com/nicojs/typed-html/graphs/contributors) for the amazing work.

Licensed under the [Apache License, Version 2.0](LICENSE).

<br />
