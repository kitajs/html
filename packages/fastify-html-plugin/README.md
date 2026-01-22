<p align="center">
   <b>Using this package?</b> Please consider <a href="https://github.com/sponsors/arthurfiorette" target="_blank">donating</a> to support my open source work ❤️
  <br />
  <sup>
   Help @kitajs/fastify-html-plugin grow! Star and share this amazing repository with your friends and co-workers!
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
  <a title="NPM Package" target="_blank" href="https://www.npmjs.com/package/@kitajs/fastify-html-plugin"><img alt="Downloads" src="https://img.shields.io/npm/dw/@kitajs/fastify-html-plugin?style=flat"></a>
  <a title="Bundle size" target="_blank" href="https://bundlephobia.com/package/@kitajs/fastify-html-plugin@latest"><img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@kitajs/fastify-html-plugin/latest?style=flat"></a>
  <a title="Last Commit" target="_blank" href="https://github.com/kitajs/html/commits/master"><img alt="Last commit" src="https://img.shields.io/github/last-commit/kitajs/html"></a>
  <a href="https://github.com/kitajs/html/stargazers"><img src="https://img.shields.io/github/stars/kitajs/html?logo=github&label=Stars" alt="Stars"></a>
</div>

<br />
<br />

<h1>🖨️ Fastify KitaJS Html Plugin</h1>

<p align="center">
  <code>@kitajs/fastify-html-plugin</code> is a fastify plugin to seamlessly integrate the KitaJS Html JSX engine into your fastify application.
  <br />
  <br />
</p>

<br />

- [Installing](#installing)
- [Preview](#preview)
- [Configuration](#configuration)
  - [Disabling Auto-Doctype Per Request](#disabling-auto-doctype-per-request)
- [Documentation](#documentation)
- [API](#api)
  - [`reply.html()`](#replyhtml)
- [Compatibility](#compatibility)
- [License](#license)

<br />
<br />

## Installing

> [!CAUTION] You **must have followed the `@kitajs/html`'s
> [Installing](https://github.com/kitajs/html/tree/master/packages/html#installing)
> guide** before continuing, otherwise you will be vulnerable to XSS attacks.

```sh
npm install @kitajs/fastify-html-plugin
```

```ts
import kitaHtmlPlugin from '@kitajs/fastify-html-plugin';
import fastify from 'fastify';

const app = fastify();

app.register(kitaHtmlPlugin);
```

<br />

## Preview

<img align="center" src="assets/preview.png" alt="Preview of using @kitajs/fastify-html-plugin with JSX in Fastify." />

## Configuration

Every option is well documented through their respective JSDoc comments, below are the
default options.

| Name          | Description                                                                                        | Default |
| ------------- | -------------------------------------------------------------------------------------------------- | ------- |
| `autoDoctype` | Whether to automatically add `<!doctype html>` to a response starting with `<html>`, if not found. | `true`  |

### Disabling Auto-Doctype Per Request

You can disable the auto-doctype feature per request using the exported `kAutoDoctype`
symbol:

```ts
import { kAutoDoctype } from '@kitajs/fastify-html-plugin';

app.get('/fragment', (req, reply) => {
  reply[kAutoDoctype] = false;
  return reply.html(<div>Just a fragment, no doctype needed</div>);
});
```

<br />

## Documentation

`@kitajs/html` is a `JSX` -> `string` runtime, this package seamlessly integrates with
`fastify` to improve the developer experience while also providing faster implementations
for this use case.

- Read [`@kitajs/html` documentation](https://github.com/kitajs/html) for help with
  templating, and all other stuff related to `<jsx />`.
- Read
  [`@kitajs/ts-html-plugin` documentation.](https://github.com/kitajs/html/tree/master/packages/ts-html-plugin)
  for help setting up the **XSS** detector and IDE intellisense.

<br />

## API

### `reply.html()`

Sends the html to the browser. This method supports all types of components, including
`<Suspense />` and `<ErrorBoundary />`.

The entire component tree will be awaited before being sent to the browser as a single
piece.

When Suspense components are found, their fallback will be synchronously awaited and sent
to the browser in the original stream, as its children are resolved, new pieces of html
will be sent to the browser. When all `Suspense`s pending promises are resolved, the
connection is closed normally.

> [!NOTE]  
> `req.id` must be used as the `Suspense`'s `rid` parameter

If the HTML does not start with a doctype and `opts.autoDoctype` is enabled, it will be
added automatically. The correct `Content-Type` header will also be defined.

```tsx
app
  .get('/html', (req, reply) =>
    reply.html(
      <html lang="en">
        <body>
          <h1>Hello, world!</h1>
        </body>
      </html>
    )
  )
  .get('/stream', (req, reply) =>
    reply.html(
      <Suspense rid={req.id} fallback={<div>Loading...</div>}>
        <MyAsyncComponent />
      </Suspense>
    )
  );
```

<br />

## Compatibility

This plugin is compatible with **Fastify 4.x** and **Fastify 5.x**.

<br />

## License

Licensed under the **MIT**. See [`LICENSE`](LICENSE) for more information.

<br />
