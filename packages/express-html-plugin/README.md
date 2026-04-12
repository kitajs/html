<p align="center">
   <b>Using this package?</b> Please consider <a href="https://github.com/sponsors/arthurfiorette" target="_blank">donating</a> to support my open source work ❤️
  <br />
  <sup>
   Help @kitajs/express-html-plugin grow! Star and share this amazing repository with your friends and co-workers!
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
  <a title="NPM Package" target="_blank" href="https://www.npmjs.com/package/@kitajs/express-html-plugin"><img alt="Downloads" src="https://img.shields.io/npm/dw/@kitajs/express-html-plugin?style=flat"></a>
  <a title="Bundle size" target="_blank" href="https://bundlephobia.com/package/@kitajs/express-html-plugin@latest"><img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@kitajs/express-html-plugin/latest?style=flat"></a>
  <a title="Last Commit" target="_blank" href="https://github.com/kitajs/html/commits/master"><img alt="Last commit" src="https://img.shields.io/github/last-commit/kitajs/html"></a>
  <a href="https://github.com/kitajs/html/stargazers"><img src="https://img.shields.io/github/stars/kitajs/html?logo=github&label=Stars" alt="Stars"></a>
</div>

<br />
<br />

<h1>🖨️ Express Kita Html Plugin</h1>

<p align="center">
  <code>@kitajs/express-html-plugin</code> is an Express middleware to seamlessly integrate the Kita Html JSX engine into your Express application.
  <br />
  <br />
</p>

- Adds `res.html()` for `JSX.Element` and `Promise<string>` responses
- Sets `Content-Type: text/html; charset=utf-8`
- Prepends `<!doctype html>` for `<html>` responses by default
- Streams `Suspense` output by matching `req.id` with `Suspense rid={req.id}`
- Preserves an existing `req.id`, otherwise generates ids like `req-1`

Use `expressKitaHtml({ disableRequestId: true })` if another middleware already owns
request ids and you want this plugin to leave `req.id` untouched.

Documentation for this package is available at
[html.kitajs.org](https://html.kitajs.org/integrations/frameworks/express).
