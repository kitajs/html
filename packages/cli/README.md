<p align="center">
   <b>Using this package?</b> Please consider <a href="https://github.com/sponsors/arthurfiorette" target="_blank">donating</a> to support my open source work ❤️
  <br />
  <sup>
   Help @kitajs/html-cli grow! Star and share this amazing repository with your friends and co-workers!
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
  <a title="NPM Package" target="_blank" href="https://www.npmjs.com/package/@kitajs/html-cli"><img alt="Downloads" src="https://img.shields.io/npm/dw/@kitajs/html-cli?style=flat"></a>
  <a title="Last Commit" target="_blank" href="https://github.com/kitajs/html/commits/master"><img alt="Last commit" src="https://img.shields.io/github/last-commit/kitajs/html"></a>
  <a href="https://github.com/kitajs/html/stargazers"><img src="https://img.shields.io/github/stars/kitajs/html?logo=github&label=Stars" alt="Stars"></a>
</div>

<br />
<br />

<h1>🏛️ KitaJS Html CLI</h1>

<p align="center">
  <code>@kitajs/html-cli</code> ships <code>kita-html check</code>, which finds XSS vulnerabilities in Kita Html JSX with the TypeScript 7.1 type checker.
  <br />
  <br />
</p>

- Reports diagnostics TS88601 to TS88604 for every TSX/JSX file of a project
- Formats: `pretty`, `tsc` (VS Code `$tsc` problem matcher), `json` and `github` (pull
  request annotations)
- Exits with `0` when clean, `1` on errors and `2` on warnings only
- Requires TypeScript 7.1 or later and Node.js 22 or later. TypeScript 6 projects use the
  deprecated `@kitajs/ts-html-plugin`

```bash
npx kita-html check
npx kita-html check --format github
```

Documentation for this package is available at
[html.kitajs.org](https://html.kitajs.org/guide/xss/cli-scanner). See also the
[output formats](https://html.kitajs.org/guide/xss/cli-output-formats) and
[error codes](https://html.kitajs.org/guide/xss/error-codes) pages.

<br />

Licensed under the [MIT](LICENSE).
