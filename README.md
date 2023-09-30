<p align="center">
   <b>Using this package?</b> Please consider <a href="https://github.com/sponsors/arthurfiorette" target="_blank">donating</a> to support my open source work ❤️
  <br />
  <sup>
   Help @kitajs/html grow! Star and share this amazing repository with your friends and co-workers!
  </sup>
</p>

<br />

<p align="center" >
  <a href="https://kita.js.org" target="_blank" rel="noopener noreferrer">
    <img src="https://kita.js.org/logo.png" width="180" alt="Kita JS logo" />
  </a>
</p>

<br />

<div align="center">
  <a title="MIT license" target="_blank" href="https://github.com/kitajs/html/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/kitajs/html"></a>
  <a title="Codecov" target="_blank" href="https://app.codecov.io/gh/kitajs/html"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/kitajs/html?token=ML0KGCU0VM"></a>
  <a title="NPM Package" target="_blank" href="https://www.npmjs.com/package/@kitajs/html"><img alt="Downloads" src="https://img.shields.io/npm/dw/@kitajs/html?style=flat"></a>
  <a title="Bundle size" target="_blank" href="https://bundlephobia.com/package/@kitajs/html@latest"><img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@kitajs/html/latest?style=flat"></a>
  <a title="Last Commit" target="_blank" href="https://github.com/kitajs/html/commits/master"><img alt="Last commit" src="https://img.shields.io/github/last-commit/kitajs/html"></a>
  <a href="https://github.com/kitajs/html/stargazers"><img src="https://img.shields.io/github/stars/kitajs/html?logo=github&label=Stars" alt="Stars"></a>
</div>

<br />
<br />

<h1>🏛️ KitaJS Html</h1>

<p align="center">
  <code>@kitajs/html</code> is a no dependencies, fast and concise package to generate HTML through JavaScript with JSX syntax.
  <br />
  <br />
</p>

<br />

- [Preview](#preview)
- [Installing](#installing)
- [Getting Started](#getting-started)
- [Sanitization](#sanitization)
  - [The Safe Attribute](#the-safe-attribute)
- [Editor Intellisense and CLI tool](#editor-intellisense-and-cli-tool)
- [Async Components](#async-components)
  - [Suspense component](#suspense-component)
  - [Error boundaries](#error-boundaries)
  - [Why JSX.Element is a Promise?](#why-jsxelement-is-a-promise)
- [Migrating from HTML](#migrating-from-html)
  - [Htmx](#htmx)
  - [Hotwire Turbo](#hotwire-turbo)
  - [Base HTML templates](#base-html-templates)
- [Compiling HTML](#compiling-html)
  - [Clean Components](#clean-components)
- [Fragments](#fragments)
- [Supported HTML](#supported-html)
  - [The `tag` tag](#the-tag-tag)
- [Extending types](#extending-types)
  - [Allow everything!](#allow-everything)
- [Performance](#performance)
- [How it works](#how-it-works)
- [Format HTML output](#format-html-output)
- [Fork credits](#fork-credits)

<br />
<br />

## Preview

<img align="center" src="assets/preview.png" alt="Example of an error thrown by this LSP plugin." />

<br />

## Installing

To use the `@kitajs/html` package, follow these steps:

1. Install the required npm packages, `@kitajs/html` and `@kitajs/ts-html-plugin`, to
   enable editor intellisense. Open your terminal and run:

   ```sh
   npm install @kitajs/html @kitajs/ts-html-plugin
   ```

2. Configure your TypeScript project to transpile TSX/JSX into JavaScript and using our
   [LSP Plugin](#editor-intellisense-and-cli-tool). Update your `tsconfig.json` file with
   the following settings:

   ```jsonc
   // tsconfig.json

   {
     "compilerOptions": {
       "jsx": "react",
       "jsxFactory": "Html.createElement",
       "jsxFragmentFactory": "Html.Fragment",
       "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
     }
   }
   ```

3. Append the
   [`xss-scan`](https://github.com/kitajs/ts-html-plugin/tree/main#running-as-cli) command
   into your test script. This CLI comes from @kitajs/ts-html-plugin, which catches XSS
   vulnerabilities that mey be introduced into your codebase. Open your `package.json`
   file and add the following script:

   ```jsonc
   // package.json

   {
     "scripts": {
       "test": "xss-scan"
     }
   }
   ```

4. Ensure that your code editor is using the TypeScript version from your project's
   `node_modules` instead of the globally installed TypeScript. For Visual Studio Code,
   you can configure this in your workspace settings:

   ```jsonc
   // .vscode/settings.json

   {
     "typescript.tsdk": "node_modules/typescript/lib"
   }
   ```

> [!WARNING]  
>  Make sure to verify that your setup is correct by writing `console.log(<div>{'<' + '/div>'}</div>);`
> in your editor. If it **PRODUCE ERRORS**, your setup is correct. Refer to the [@kitajs/ts-html-plugin](https://github.com/kitajs/ts-html-plugin)
> repository for more details on setting up editor intellisense.

<br />

## Getting Started

After successfully installing and configuring your project, you can start using JSX syntax
to generate HTML. Here are two options for importing the `@kitajs/html` package:

1. **Import it manually**: Import the package in your TypeScript files where you need it,
   avoiding global scope pollution.

   ```tsx
   // my-file.tsx

   console.log(<div>Html import needs to be in scope!</div>);
   ```

2. **Use the register to add a global namespace**: Import the `register` to globally
   register all necessary functions for convenience.

   ```tsx
   // Import the register to globally register all needed functions
   import '@kitajs/html/register';

   // another-file.tsx
   console.log(<div>It works without importing!</div>);
   ```

Now you can use JSX to generate HTML throughout your project. Always use the `safe`
attribute or manually call `Html.escapeHtml` to protect against XSS vulnerabilities when
rendering user input.

Ensuring XSS prevention is vital to guarantee your application's security. You can employ
the [`@kitajs/ts-html-plugin`](https://github.com/kitajs/ts-html-plugin) to catch XSS
issues in your code editor and enhance your code's security.

<br />

## Sanitization

> [!IMPORTANT]  
> Please utilize our `@kitajs/ts-html-plugin` to emit TypeScript errors wherever you are
> exposed to XSS. Refer to [Getting Started](#getting-started) for installation
> instructions.

This package sanitizes every attribute by default. However, since the resulting element is
always a string, it's impossible to differentiate an HTML element created by a `<tag>` or
from user input. This necessitates the use of the provided [`safe`](#the-safe-attribute)
or manual invocation of `Html.escapeHtml`.

```tsx
<div>⚠️ This will NOT be escaped and WILL expose you to XSS</div>

<div attr="This WILL be escaped"></div>
<div safe>This WILL be escaped</div>
<div>{Html.escapeHtml('This WILL be escaped')}</div>
```

Here's an example of how this is **DANGEROUS** for your application:

```tsx
user = {
  name: 'Bad guy',
  description: '</div><script>getStoredPasswordAndSentToBadGuysServer()</script>'
}

<div class="user-card">{user.description}</div>
// Renders this HTML, which will execute malicious code:
<div class="user-card">
  <script>getStoredPasswordAndSentToBadGuysServer()</script>
</div>

<div class="user-card" safe>{user.description}</div>
// Renders this safe HTML, which will NOT execute any malicious code:
<div class="user-card">
  &lt;/div&gt;&lt;script&gt;getStoredPasswordAndSentToBadGuysServer()&lt;/script&gt;
</div>
```

<br />

### The Safe Attribute

Always use the `safe` attribute when rendering uncontrolled user input. This will sanitize
the contents and prevent XSS attacks.

```tsx
function UserCard({ name, description, date, about }) {
  return (
    <div class="card">
      <h1 safe>{name}</h1>
      <br />
      <p safe>{description}</p>
      <br />
      // Controlled input, no need to sanitize
      <time datetime={date.toISOString()}>{date.toDateString()}</time>
      <br />
      <p safe>{about}</p>
    </div>
  );
}
```

Note that you should only use the `safe` attribute at the very bottom of the HTML tree
where it's needed.

<br />

## Editor Intellisense and CLI tool

<p align="center">
  <img align="center" src="https://github.com/kitajs/ts-html-plugin/blob/main/assets/preview.png?raw=true" alt="Example of an error thrown by @kitajs/ts-html-plugin." width="75%" />
</p>

<h2>⚠️</h2>

**Note:** This section has been relocated to the
[@kitajs/ts-html-plugin](https://github.com/kitajs/ts-html-plugin) repository.

Please consult their
"[Getting Started](https://github.com/kitajs/ts-html-plugin#getting-started)" section for
instructions on enabling editor IntelliSense and using the CLI tool.

<br />
<br />
<br />
<br />

## Async Components

Async components are supported. When any child or sub child of a component tree is a
promise, the whole tree will return a promise of the html string.

If no async components are found, the result will be simply a string, and you can safely
cast it into a string.

```tsx
async function Async() {
  await callApi();
  return <div>Async!</div>;
}

function Sync() {
  return <div>Sync!</div>;
}

const async = (
  <div>
    <Async />
  </div>
);

async instanceof Promise;

const sync: string = (
  <div>
    <Sync />
  </div>
);

typeof sync === 'string';
```

A `JSX.Element` will always be a string. Once a children element is a async component, the
entire upper tree will also be async.
[Learn when JSX.Element is a Promise](#why-jsxelement-is-a-promise).

<br />

### Suspense component

The only problem when rendering templates is that you must wait for the whole template to be
rendered before sending it to the client. This is not a problem for small templates, but
it can be a problem for large templates.

To solve this problem, we provide a `Suspense` component that combined with
`renderToStream()` rendering method, will stream a fallback component while it waits for
his children to be rendered. This is a perfect combo to use with
[async components](#async-components).

```tsx
import { Suspense, renderToStream } from '@kitajs/html/suspense';

async function MyAsyncComponent() {
  const data = await database.query();
  return <User name={data.username} />;
}

function renderUserPage(rid: number) {
  return (
    <Suspense
      rid={rid}
      fallback={<div>Loading username...</div>}
      catch={(err) => <div>Error: {err.stack}</div>}
    >
      <MyAsyncComponent />
    </Suspense>
  );
}

// Html is a string readable stream that can be piped to the client
const html = renderToStream(renderUserPage);
```

> [!NOTE]  
> The `renderToStream()` is returns a native node/bun stream, head over to our
> [suspense-server](examples/suspense-server.tsx) example to see how to use it with
> node:http, Express or Fastify servers.

The above example would render `<div>Loading username...</div>` while waiting for the
`MyAsyncComponent` to be rendered.

When using `Suspense`, you cannot just call the component and get the html string, you
need to use the `renderToStream` function to get a stream that can be piped to the client
with updates. Otherwise, the fallback would render forever.

As the result of any JSX component is always a string, you must use the `rid` provided by
`renderToStream` into all your suspense components, this way we can identify which
suspense is for which request and be able to render concurrent requests.

Suspense also accepts async fallbacks, but it blocks rendering until the fallback is
resolved.

```tsx
function renderTemplate(rid: number) {
  return (
    <Suspense
      rid={rid}
      fallback={<MyAsyncFallback />}
      catch={(err) => <div>Error: {err.stack}</div>}
    >
      <MyAsyncComponent />
    </Suspense>
  );
}
```

The above example would only return anything after `MyAsyncFallback` is resolved. To catch
async fallback errors, you must wrap it into a [`ErrorBoundary`](#error-boundaries).

<br />

### Error boundaries

The same way as promises must be awaited to resolve its own html, errors must be caught.
Outside of suspense components, you can use the provided error boundaries to catch errors.

```tsx
import { ErrorBoundary } from '@kitajs/html/error-boundary';

async function MyAsyncComponent() {
  const data = await database.query(); // this promise may reject
  return <User name={data.username} />;
}

function renderTemplate() {
  return (
    <ErrorBoundary catch={(err) => <div>Error: {err.stack}</div>}>
      <MyAsyncComponent />
    </ErrorBoundary>
  );
}

// If MyAsyncComponent throws an error, it will render <div>Error: ...</div>
const html = await renderTemplate();
```

Error boundaries will only work for errors thrown inside async components, for sync
components you must use try/catch.

```tsx
function MySyncComponent() {
  try {
    const data = database.query(); // this may throw an error
    return <User name={data.username} />;
  } catch (err) {
    return <div>Error: {err.stack}</div>;
  }
}
```

Error boundaries outside suspense components will only catch errors thrown by the fallback
component. You must use the Suspense's `catch` property to handle errors thrown by its
children components.

```tsx
function renderTemplate(rid: number) {
  return (
    <ErrorBoundary catch={<div>fallback error</div>}>
      <Suspense
        rid={rid}
        fallback={<MyAsyncFallback />}
        catch={<div>Children error</div>}
      >
        <MyAsyncComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

const html = renderToStream(renderTemplate);
```

The above example would render `<div>Children error</div>` if `MyAsyncComponent` throws an
error, or `<div>fallback error</div>` if `MyAsyncFallback` throws an error. If both throws
an error, the first error will be changed to the second error as soon as the children
error is thrown.

<br />

### Why JSX.Element is a Promise?

> ℹ️ Until [#14729](https://github.com/microsoft/TypeScript/issues/14729) gets
> implemented, you need to manually cast `JSX.Element` into strings if you are sure there
> is no inner async components in your component tree.

JSX elements are mostly strings everywhere. However, as the nature of this package, once a
children element is a async component, the entire upper tree will also be async. Unless
you are sure that no other component in your entire codebase is async, you should always
handle both string and promise cases.

```tsx
// It may or may not have inner async components.
const html = <Layout />;

if (html instanceof Promise) {
  // I'm a promise, I should be awaited
  console.log(await html);
} else {
  // I'm a string, I can be used as is
  console.log(html);
}
```

<br />

## Migrating from HTML

Migrating from plain HTML to JSX can be a pain to convert it all manually, as you will
find yourself hand placing quotes and closing void elements.

You can use [**Html To Jsx**](https://magic.reactjs.net/htmltojsx.htm).

```html
<!-- Hello world -->
<div class="awesome" style="border: 1px solid red">
  <label for="name">Enter your name: </label>
  <input type="text" id="name" />
</div>
<p>Enter your HTML here</p>
```

Results into:

```tsx
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

### Htmx

The usage of [htmx.org](https://htmx.org/) is super common with this project, this is why
we also provide type definitions for all HTMX attributes.

You just need to add this triple slash directive to the top of your file:

```tsx
/// <reference types="@kitajs/html/htmx.d.ts" />

import '@kitajs/html/register';

const html = (
  // Type checking and intellisense for all HTMX attributes
  <div hx-get="/api" hx-trigger="click" hx-target="#target">
    Click me!
  </div>
);
```

<br />

### Hotwire Turbo

This project supports the usage of [Turbo Hotwire](https://turbo.hotwired.dev/). We
provide a separate export that you can use to provide type definitions for the elements
and attributes used with Turbo Hotwire.

You just need to add this triple slash directive to the top of your file:

```tsx
/// <reference types="@kitajs/html/hotwire-turbo.d.ts" />

import '@kitajs/html/register';

const html = (
  // Type checking and intellisense for all HTMX attributes
  <turbo-frame id="messages">
    <a href="/messages/expanded">Show all expanded messages in this frame.</a>

    <form action="/messages">Show response from this form within this frame.</form>
  </turbo-frame>
);
```

<br />

### Base HTML templates

Often you will have a "template" html with doctype, things on the head, body and so on...
The layout is also a very good component to be compiled. Here is a effective example on
how to do it:.

```tsx
export const Layout = html.compile((p: Html.PropsWithChildren<{ head: string }>) => (
  <>
    {'<!doctype html>'}
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        {p.head}
      </head>
      <body>{p.children}</body>
    </html>
  </>
));

const html = (
  <Layout
    head={
      <>
        <link rel="stylesheet" href="/style.css" />
        <script src="/script.js" />
      </>
    }
  >
    <div>Hello World</div>
  </Layout>
);
```

<br />

## Compiling HTML

Compiles a **clean component** into a super fast component. This does not support unclean
components / props processing.

This mode works just like prepared statements in SQL. Compiled components can give up to
[**2000**](#performance) times faster html generation. This is a opt-in feature that you
may not be able to use everywhere!

```tsx
import Html from '@kitajs/html';

function Component(props: Html.PropsWithChildren<{ name: string }>) {
  return <div>Hello {props.name}</div>;
}

const compiled = Html.compile<typeof Component>(Component);

compiled({ name: 'World' });
// <div>Hello World</div>

const compiled = Html.compile((p) => <div>Hello {p.name}</div>);

compiled({ name: 'World' });
// <div>Hello World</div>
```

Properties passed for compiled components **ARE NOT** what will be passed as argument to
the generated function.

```tsx
const compiled = Html.compile((t) => {
  // THIS WILL NOT print 123, but a string used by .compile instead
  console.log(t.asd);
  return <div></div>;
});

compiled({ asd: 123 });
```

That's the reason on why you cannot compile unclean components, as they need to process
the props before rendering.

<br />

### Clean Components

A **clean component** is a component that does not process props before applying them to
the element. This means that the props are applied to the element as is, and you need to
process them before passing them to the component.

```tsx
// Clean component, render as is
function Clean(props: PropsWithChildren<{ repeated: string }>) {
  return <div>{props.repeated}</div>;
}

// Calculation is done before passing to the component
html = <Clean name={'a'.repeat(5)} />;

// Unclean component, process before render
function Unclean(props: { repeat: string; n: number }) {
  return <div>{props.repeat.repeat(props.n)}</div>;
}

// Calculation is done inside the component, thus cannot be used with .compile()
html = <Unclean repeat="a" n={5} />;
```

<br />

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

<br />

## Supported HTML

All HTML elements and attributes should be supported.

- [Supported html elements](https://html.spec.whatwg.org/multipage#toc-semantics)
- [Supported html events](https://www.w3schools.com/tags/ref_eventattributes.asp)

**Missing an element or attribute?** Please create an issue or a PR to add it. It's easy
to add.

<br />

### The `tag` tag

The `<tag of="">` tag is a custom internal tag that allows you to render any runtime
selected tag you want. Possibly reasons to prefer this tag over extending types:

- You want to render a tag that is chosen at runtime.
- You don't want to mess up with extending globally available types.
- You are writing javascript with typechecking enabled.
- You are writing a library and should not extend types globally.
- You need to use kebab-case tags, which JSX syntax does not support.

```tsx
<tag of="asd" />
// <asd></asd>

<tag of="my-custom-KEBAB" />
// <my-custom-KEBAB></my-custom-KEBAB>
```

We do recommend using [extending types](#extending-types) instead, as it will give you
intellisense and type checking.

<br />

## Extending types

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

### Allow everything!

We also provide a way to allow any tag/attribute combination, altough we **do not
recommend using it**.

Just add this triple slash directive to the top of your file:

```tsx
/// <reference types="@kitajs/html/all-types.d.ts" />
```

<br />

## Performance

This package is just a string builder on steroids, as you can see
[how this works](#how-it-works). This means that most way to isolate performance
differences is to micro benchmark.

You can run this yourself by running `pnpm bench`. The benchmark below ran with a 13600k
@5.1GHz machine.

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

This package just aims to be a drop in replacement syntax for JSX, and it works because
you [tell tsc to transpile](#getting-started) JSX syntax to calls to our own `html`
namespace.

```tsx
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
);
```

Which, when called, returns this string:

```js
'<ol start="2"><li>1</li><li>2</li></ol>';
```

<br />

## Format HTML output

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

👉 There's an open PR to implement this feature natively, wanna work on it? Check
[this PR](https://github.com/kitajs/html/pull/1).

<br />

## Fork credits

This repository was initially forked from
[typed-html](https://github.com/nicojs/typed-html) and modified to add some features and
increase performance.

Initial credits to [nicojs](https://github.com/nicojs) and
[contributors](https://github.com/nicojs/typed-html/graphs/contributors) for the amazing
work.

Licensed under the [Apache License, Version 2.0](LICENSE).

<br />
