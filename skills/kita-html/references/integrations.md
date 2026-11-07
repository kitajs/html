# Integrations

Use this when the user asks for framework-specific Kita code.

Latest docs:

- Fastify: `https://html.kitajs.org/integrations/frameworks/fastify.md`
- Express: `https://html.kitajs.org/integrations/frameworks/express.md`
- H3: `https://html.kitajs.org/integrations/frameworks/h3.md`
- Nitro: `https://html.kitajs.org/integrations/frameworks/nitro.md`
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

## H3

- Install `@kitajs/h3-html-plugin` and `h3` v2.
- Register `new H3().register(h3KitaHtml())` before routes.
- Return `event.html(...)` from handlers.
- For Suspense, use `rid={event.context.kitaHtml!.requestId}`, or enable
  `h3KitaHtml({ autoSuspense: true })` and use `AutoSuspense`.
- Use `defineKitaHandler((event) => <Page />)` when an async root creates its first
  Suspense boundary after an `await`. `event.html(...)` receives already evaluated JSX and
  cannot reserve that state in time.
- Suspense needs a Node-compatible runtime.

```tsx
import { H3 } from 'h3'
import { h3KitaHtml } from '@kitajs/h3-html-plugin'

const app = new H3().register(h3KitaHtml())

app.get('/', (event) =>
  event.html(
    <html lang="en">
      <body>
        <h1>Hello</h1>
      </body>
    </html>
  )
)
```

## Nitro

- Install `@kitajs/nitro-html-plugin` and `nitro` v3, then add `nitroKitaHtml()` to
  `modules` in `nitro.config.ts`.
- Each `.tsx`/`.jsx` file in `server/pages` default-exports
  `(event: H3Event) => JSX.Element` and becomes a lazy GET and HEAD route. `[id]` is a
  parameter, `[...path]` a catch-all, `(group)` folders do not affect the URL, and
  `_`-prefixed files are ignored.
- A page resolving to the root catch-all (`[...].tsx`) is Nitro's renderer for unmatched
  routes. Set `event.res.status = 404` when it is a not-found page.
- `AutoSuspense` works in pages without extra options.
- Do not write pages as Nitro route handlers with manual HTML responses.

```tsx
// server/pages/about.tsx
export default function About() {
  return (
    <html lang="en">
      <body>
        <h1>About</h1>
      </body>
    </html>
  )
}
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
