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

> [!WARNING]  
> Learn how to [sanitize](#sanitization) and avoid [xss](https://owasp.org/www-community/attacks/xss) vulnerabilities in your code!

<br />

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installing](#installing)
- [Getting Started](#getting-started)
- [Sanitization](#sanitization)
  - [The safe attribute](#the-safe-attribute)
  - [Typescript Plugin](#typescript-plugin)
- [Migrating from HTML](#migrating-from-html)
  - [Base HTML templates](#base-html-templates)
  - [Htmx](#htmx)
  - [Hotwire Turbo](#hotwire-turbo)
- [Compiling HTML](#compiling-html)
  - [Clean Components](#clean-components)
- [Fragments](#fragments)
- [Supported HTML](#supported-html)
  - [The `tag` tag](#the-tag-tag)
- [Async Components](#async-components)
  - [Why JSX.Element is a Promise?](#why-jsxelement-is-a-promise)
- [Extending types](#extending-types)
  - [Allow everything!](#allow-everything)
- [Performance](#performance)
- [How it works](#how-it-works)
- [Format HTML output](#format-html-output)
- [Fork credits](#fork-credits)

<br />

## Installing

```sh
npm install @kitajs/html @kitajs/ts-html-plugin  # or yarn add @kitajs/html @kitajs/ts-html-plugin
```

<br />

## Getting Started

Install `@kitajs/html` with your favorite package manager, import it into the top of your `jsx`/`tsx` file and change your tsconfig.json to transpile jsx syntax.

```jsonc
// tsconfig.json

{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "Html.createElement",
    "jsxFragmentFactory": "Html.Fragment",
    // Plugin to add XSS warnings and alerts.
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
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

> [!IMPORTANT]  
> Please use our `@kitajs/ts-html-plugin` to emit TS errors on where you are exposed to XSS. Head over to [getting started](#getting-started) to install it.

<br />

This package sanitizes every attribute by default. However, as the result is always a string, we cannot differentiate a html element created by a `<tag>` or from a user input. This forces you to use the provided [`safe`](#the-safe-attribute) or manually call `Html.escapeHtml`.

```jsx
<div>⚠️ This will NOT be escaped. and WILL expose you to XSS</div>

<div attr="This WILL be escaped"></div>
<div safe>This WILL be escaped</div>
<div>{Html.escapeHtml('This WILL be escaped')}</div>
```

Here's an example of how this is **DANGEROUS** to your application:

```jsx
user = {
  name: 'Bad guy',
  description: '</div><script>getStoredPasswordAndSentToBadGuysServer()</script>'
}

<div class="user-card">{user.description}</div>
// Renders this html which will execute malicious code:
<div class="user-card"><script>getStoredPasswordAndSentToBadGuysServer()</script></div>

<div class="user-card" safe>{user.description}</div>
// Renders this safe html, which will NOT execute any malicious code:
<div class="user-card">&lt;/div&gt;&lt;script&gt;getStoredPasswordAndSentToBadGuysServer()&lt;/script&gt;</div>
```

<br />

### The safe attribute

You should always use the `safe` attribute when you are rendering uncontrolled user input. This will sanitize its contents and avoid XSS attacks.

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

<br />

### Typescript Plugin

By installing [`@kitajs/ts-html-plugin`](https://github.com/kitajs/ts-html-plugin), we can add errors and warnings in your editor. To prevent IDE incompatibility and problems, please install it globally.

```sh
npm i -g @kitajs/ts-html-plugin
```

Make sure to enable it in your tsconfig.json, and you are ready to go!

```jsonc
// tsconfig.json

{
  "compilerOptions": {
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
  }
}
```

```jsonc
// .vscode/settings.json

{
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

[Make sure to understand what language service plugins can and cannot do.](https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin#whats-a-language-service-plugin)

<br />

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

### Htmx

The usage of [htmx.org](https://htmx.org/) is super common with this project, this is why we also provide type definitions for all HTMX attributes.

You just need to add this triple slash directive to the top of your file:

```tsx
/// <reference types="@kitajs/html/htmx.d.ts" />

import '@kitajs/html/register'

const html = (
  // Type checking and intellisense for all HTMX attributes
  <div hx-get="/api" hx-trigger="click" hx-target="#target">
    Click me!
  </div>
)
```

<br />

### Hotwire Turbo

This project supports the usage of [Turbo Hotwire](https://turbo.hotwired.dev/). We provide a separate export
that you can use to provide type definitions for the elements and attributes used with Turbo Hotwire.

You just need to add this triple slash directive to the top of your file:

```tsx
/// <reference types="@kitajs/html/hotwire-turbo.d.ts" />

import '@kitajs/html/register'

const html = (
  // Type checking and intellisense for all HTMX attributes
  <turbo-frame id="messages">
    <a href="/messages/expanded">
      Show all expanded messages in this frame.
    </a>

    <form action="/messages">
      Show response from this form within this frame.
    </form>
  </turbo-frame>
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
function Clean(props: PropsWithChildren<{ repeated: string }>) {
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

Async components are supported. When any child or sub child of a component tree is a promise, the whole tree will return a promise of the html string.

If no async components are found, the result will be simply a string, and you can safely cast it into a string.

```jsx
async function Async() {
  await callApi();
  return <div>Async!</div>
}

function Sync() {
  return <div>Sync!</div>
}

// Safe to cast into a string
const async = <div><Async /></div> as Promise<string>
const sync: string = <div><Sync /></div> as string
```

A `JSX.Element` will always be a string. Once a children element is a async component, the entire upper tree will also be async.

<br />

### Why JSX.Element is a Promise?

> ℹ️ Until [#14729](https://github.com/microsoft/TypeScript/issues/14729) gets implemented, you need to manually cast `JSX.Element` into strings if you are sure there is no inner async components in your component tree.

JSX elements are mostly strings everywhere. However, as the nature of this package, once a children element is a async component, the entire upper tree will also be async. Unless you are sure that no other component in your entire codebase is async, you should always handle both string and promise cases.

```jsx
// It may or may not have inner async components.
const html = <Layout />

if (html instanceof Promise) {
  // I'm a promise, I should be awaited
  console.log(await html)
} else {
  // I'm a string, I can be used as is
  console.log(html)
}
```

<br />

## Extending types

Just as exemplified above, you may also want to add custom properties to your elements. You can do this by extending the `JSX` namespace.

```tsx
declare global {
  namespace JSX {
    // Adds a new element called mathPower
    interface IntrinsicElements {
      mathPower: HtmlTag & {
        // Changes properties to the math-power element
        ['my-exponential']: number
        // this property becomes the <>{children}</> type
        children: number
      }
    }

    // Adds hxBoost property to all elements native elements (those who extends HtmlTag)
    interface HtmlTag {
      ['hx-boost']: boolean
      // TIP: We already provide HTMX types, check them out!
    }
  }
}

const element = (
  <mathPower my-exponential={2} hx-boost>
    {3}
  </mathPower>
)
// Becomes <math-power my-exponential="2" hx-boost>3</math-power>
```

### Allow everything!

We also provide a way to allow any tag/attribute combination, altough we **do not recommend using it**.

Just add this triple slash directive to the top of your file:

```tsx
/// <reference types="@kitajs/html/all-types.d.ts" />
```

<br />

## Performance

This package is just a string builder on steroids, as you can see [how this works](#how-it-works). This means that most way to isolate performance differences is to micro benchmark.

You can run this yourself by running `pnpm bench`. The benchmark below ran with a 13600k @5.1GHz machine.

```markdown
# Benchmark

- 2023-09-23T19:26:24.506Z
- Node: v20.7.0
- V8: 11.3.244.8-node.15
- OS: linux
- Arch: x64

## Hello World

| Runs   | @kitajs/html | typed-html | +     | .compile() | + / @kitajs/html | + / typed-html |
| ------ | ------------ | ---------- | ----- | ---------- | ---------------- | -------------- |
| 10     | 0.0071ms     | 0.0123ms   | 1.72x | 0.0459ms   | 0.16x            | 0.27x          |
| 10000  | 0.4891ms     | 1.9689ms   | 4.03x | 0.4315ms   | 1.13x            | 4.56x          |
| 100000 | 4.717ms      | 13.653ms   | 2.89x | 1.5551ms   | 3.03x            | 8.78x          |

## Mdn Homepage

| Runs   | @kitajs/html | typed-html   | +     | .compile() | + / @kitajs/html | + / typed-html |
| ------ | ------------ | ------------ | ----- | ---------- | ---------------- | -------------- |
| 10     | 0.6441ms     | 3.0466ms     | 4.73x | 0.0029ms   | 221.57x          | 1048.03x       |
| 10000  | 601.5763ms   | 3013.5356ms  | 5.01x | 0.2293ms   | 2623.21x         | 13140.72x      |
| 100000 | 5953.055ms   | 30076.7341ms | 5.05x | 1.1917ms   | 4995.36x         | 25238.17x      |

## Many Props

| Runs   | @kitajs/html | typed-html  | +     | .compile() | + / @kitajs/html | + / typed-html |
| ------ | ------------ | ----------- | ----- | ---------- | ---------------- | -------------- |
| 10     | 0.1971ms     | 0.9631ms    | 4.89x | 0.0026ms   | 76.26x           | 372.58x        |
| 10000  | 164.2186ms   | 698.8376ms  | 4.26x | 0.682ms    | 240.78x          | 1024.67x       |
| 100000 | 1688.9518ms  | 7065.3811ms | 4.18x | 2.8688ms   | 588.73x          | 2462.82x       |

## Many Components

| Runs   | @kitajs/html | typed-html  | +     | .compile() | + / @kitajs/html | + / typed-html |
| ------ | ------------ | ----------- | ----- | ---------- | ---------------- | -------------- |
| 10     | 0.2367ms     | 0.4481ms    | 1.89x | 0.0041ms   | 57.64x           | 109.14x        |
| 10000  | 148.0245ms   | 368.8733ms  | 2.49x | 1.2694ms   | 116.61x          | 290.6x         |
| 100000 | 1548.758ms   | 3748.9902ms | 2.42x | 6.009ms    | 257.74x          | 623.9x         |
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
