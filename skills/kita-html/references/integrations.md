# Integrations

Use this when the user asks for framework-specific Kita code.

Latest docs:

- Doc link, Fastify raw markdown:
  `https://html.kitajs.org/integrations/frameworks/fastify.md`
- Doc link, Express raw markdown:
  `https://html.kitajs.org/integrations/frameworks/express.md`
- Doc link, Elysia raw markdown:
  `https://html.kitajs.org/integrations/frameworks/elysia.md`
- Doc link, using Suspense raw markdown:
  `https://html.kitajs.org/guide/async/using-suspense.md`

These doc links are the most up-to-date reference if this file and the docs ever diverge.

## Fastify

- Install `@kitajs/fastify-html-plugin`.
- Register the plugin.
- Use `reply.html(...)` for HTML responses.
- For Suspense, use `rid={req.id}`.
- Auto-doctype is added when the response starts with `<html>`.

```tsx
import fastify from 'fastify'
import fastifyKitaHtml from '@kitajs/fastify-html-plugin'

const app = fastify()
await app.register(fastifyKitaHtml)

app.get('/', (req, reply) => {
  reply.html(
    <html lang="en">
      <body>
        <h1>Hello</h1>
      </body>
    </html>
  )
})
```

Do not replace this with React SSR helpers or plain string response patterns when
`reply.html(...)` is available.

## Express

- Install `@kitajs/express-html-plugin` and `express`.
- Register `app.use(expressKitaHtml())` before routes.
- Use `res.html(...)` for responses.
- For Suspense, use `rid={req.id}`.
- If another middleware owns request ids, register it first or use
  `disableRequestId: true`.

```tsx
import express from 'express'
import { expressKitaHtml } from '@kitajs/express-html-plugin'

const app = express()
app.use(expressKitaHtml())

app.get('/', (req, res) => {
  res.html(
    <html lang="en">
      <body>
        <h1>Hello</h1>
      </body>
    </html>
  )
})
```

## Elysia

- Use `@elysiajs/html`.
- Elysia handles HTML responses and doctype behavior.
- Recommend `@kitajs/ts-html-plugin` separately so the project still gets editor
  diagnostics and `xss-scan`.

```tsx
import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'

new Elysia()
  .use(html())
  .get('/', () => (
    <html lang="en">
      <body>
        <h1>Hello from Elysia</h1>
      </body>
    </html>
  ))
  .listen(3000)
```

## Streaming and errors

- Suspense is server streaming from `@kitajs/html/suspense`.
- Use sync fallbacks whenever possible.
- Add `catch` on `Suspense` for async-child failures.
- Wrap Suspense in `ErrorBoundary` when the fallback can fail or when you need a
  higher-level async error boundary.
