# Integrations

Use this when the user asks for framework-specific Kita code.

Latest docs:

- Fastify: `https://html.kitajs.org/integrations/frameworks/fastify.md`
- Express: `https://html.kitajs.org/integrations/frameworks/express.md`
- Elysia: `https://html.kitajs.org/integrations/frameworks/elysia.md`
- Using Suspense: `https://html.kitajs.org/guide/async/using-suspense.md`

If this file and the docs disagree, trust the docs.

## Fastify

- Install `@kitajs/fastify-html-plugin`.
- Register the plugin.
- Use `reply.html(...)` for HTML responses.
- For Suspense, use `rid={req.id}`.
- Auto-doctype is added when the response starts with `<html>`.

```tsx
import fastify from 'fastify'
import { fastifyKitaHtml } from '@kitajs/fastify-html-plugin'

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
- Auto-doctype is added when the response starts with `<html>`.
- If another middleware owns request IDs, register it first or use
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
- Recommend `@kitajs/html-cli` separately so the project still runs `kita-html check` in
  CI.

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
