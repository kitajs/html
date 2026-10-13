<p align="center">
   <b>Using this package?</b> Please consider <a href="https://github.com/sponsors/arthurfiorette" target="_blank">donating</a> to support my open source work ❤️
  <br />
  <sup>
   Help @kitajs/ts-html-plugin grow! Star and share this amazing repository with your friends and co-workers!
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
  <a title="NPM Package" target="_blank" href="https://www.npmjs.com/package/@kitajs/ts-html-plugin"><img alt="Downloads" src="https://img.shields.io/npm/dw/@kitajs/ts-html-plugin?style=flat"></a>
  <a title="Bundle size" target="_blank" href="https://bundlephobia.com/package/@kitajs/ts-html-plugin@latest"><img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@kitajs/ts-html-plugin/latest?style=flat"></a>
  <a title="Last Commit" target="_blank" href="https://github.com/kitajs/html/commits/master"><img alt="Last commit" src="https://img.shields.io/github/last-commit/kitajs/html"></a>
  <a href="https://github.com/kitajs/html/stargazers"><img src="https://img.shields.io/github/stars/kitajs/html?logo=github&label=Stars" alt="Stars"></a>
</div>

<br />
<br />

<h1>🏛️ KitaJS TypeScript Html Plugin</h1>

<p align="center">
  <code>@kitajs/ts-html-plugin</code> is a TypeScript language service plugin and CLI that finds XSS vulnerabilities in Kita Html JSX.
  <br />
  <br />
</p>

<img align="center" src="assets/preview.png" alt="Example of an error thrown by this LSP plugin." />

<br />

- Reports unsafe JSX in your editor as you type, through diagnostics TS88601 to TS88604
- Ships the `xss-scan` CLI, which runs the same checks across a project in CI
- `xss-scan` exits with `0` when clean, `1` on errors and `2` on warnings only
- Does not load in editors that use `tsgo`, but `xss-scan` still works

Documentation for this package is available at
[html.kitajs.org](https://html.kitajs.org/guide/getting-started). See also the
[CLI scanner](https://html.kitajs.org/guide/xss/cli-scanner) and
[error codes](https://html.kitajs.org/guide/xss/error-codes) pages.

<br />

Licensed under the [MIT](LICENSE).
