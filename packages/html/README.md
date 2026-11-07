<p align="center">
   <b>Using this package?</b> Please consider <a href="https://github.com/sponsors/arthurfiorette" target="_blank">donating</a> to support my open source work ❤️
  <br />
  <sup>
   Help @kitajs/html grow! Star and share this amazing repository with your friends and co-workers!
  </sup>
</p>

<br />

<p align="center" >
  <a href="https://kitajs.org" target="_blank" rel="noopener noreferrer">
    <img src="https://kitajs.org/logo.png" width="180" alt="Kita JS logo" />
  </a>
</p>

<br />

<div align="center">
  <a href="https://kitajs.org/discord"><img src="https://img.shields.io/discord/1216165027774595112?logo=discord&logoColor=white&color=%237289da" alt="Discord"></a>
  <a title="MIT license" target="_blank" href="https://github.com/kitajs/html/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/kitajs/html"></a>
  <a title="Codecov" target="_blank" href="https://app.codecov.io/gh/kitajs/html"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/kitajs/html?token=ML0KGCU0VM"></a>
  <a title="NPM Package" target="_blank" href="https://www.npmjs.com/package/@kitajs/html"><img alt="Downloads" src="https://img.shields.io/npm/dw/@kitajs/html?style=flat"></a>
  <a title="Bundle size" target="_blank" href="https://bundlephobia.com/package/@kitajs/html@latest"><img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@kitajs/html/latest?style=flat"></a>
  <a title="Last Commit" target="_blank" href="https://github.com/kitajs/html/commits/master"><img alt="Last commit" src="https://img.shields.io/github/last-commit/kitajs/html"></a>
  <a href="https://github.com/kitajs/html/stargazers"><img src="https://img.shields.io/github/stars/kitajs/html?logo=github&label=Stars" alt="Stars"></a>
</div>

<br />
<br />

<h1>🏛️ Kita Html</h1>

<p align="center">
  <code>@kitajs/html</code> is a JSX runtime that renders to plain HTML strings.
  <br />
  <br />
</p>

<img align="center" src="assets/preview.png" alt="Sample of generating html tags with jsx syntax." />

<br />

- Compiles JSX to string concatenation, with no virtual DOM
- Async components and `Suspense` streaming
- Type definitions for every HTML element, with opt-in HTMX, Alpine.js and Hotwire Turbo
  extensions
- Works with Fastify, Express, Elysia, Hono, Bun, or any code that handles strings

> [!CAUTION] Children are not escaped by default. Run `kita-html check` from
> `@kitajs/html-cli` and use the `safe` attribute for user input, otherwise your
> application is vulnerable to XSS.

Documentation for this package is available at
[html.kitajs.org](https://html.kitajs.org/guide/getting-started).

<br />

Licensed under the [MIT](LICENSE). Originally forked from
[typed-html](https://github.com/nicojs/typed-html).
