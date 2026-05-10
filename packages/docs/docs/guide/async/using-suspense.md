---
description:
  Wrap async sections with Suspense, stream fallbacks, handle errors, share request IDs,
  and avoid async fallback delays.
---

# Using Suspense

Import `Suspense` and `renderToStream` from `@kitajs/html/suspense`.

## Basic usage

Wrap async components in a `Suspense` element with a `rid`, a `fallback`, and optionally a
`catch` handler. Then pass the tree to `renderToStream`, which returns a `Readable`
stream.

```tsx twoslash kita=stream
import { jsx as __jsx } from '@kitajs/html/jsx-runtime'
import { Suspense, renderToStream } from '@kitajs/html/suspense'

let api = {
  async getStats(id: string): Promise<{ totalPosts: number }> {
    return { totalPosts: Number(id) }
  }
}

// ---cut---

async function UserStats({ id }: { id: string }) {
  const stats = await api.getStats(id)
  return <div>{stats.totalPosts} posts</div>
}

const stream = renderToStream((rid) => (
  <html>
    <body>
      <h1>Dashboard</h1>
      <Suspense rid={rid} fallback={<div>Loading stats...</div>}>
        <UserStats id="123" />
      </Suspense>
    </body>
  </html>
))
```

The `renderToStream` callback receives the `rid` automatically. Pipe the returned stream
to your HTTP response.

```tsx
import { text } from 'node:stream/consumers'

// As a stream
stream.pipe(response)

// Or consume entirely (loses streaming benefits, useful for testing)
const html = await text(stream)
```

## Custom request IDs

If you need to control the request ID, pass it as the second argument and use it directly
in your JSX.

```tsx twoslash kita=stream
import { jsx as __jsx } from '@kitajs/html/jsx-runtime'
import { Suspense, renderToStream } from '@kitajs/html/suspense'

const myCustomId = `req-${Math.random().toString(36).slice(2)}`

async function AsyncContent() {
  return <div>Loaded content</div>
}

// ---cut---
const stream = renderToStream(
  (rid) => (
    <Suspense rid={rid} fallback={<div>Loading...</div>}>
      <AsyncContent />
    </Suspense>
  ),
  myCustomId
)
```

## Error handling

The `catch` prop handles errors thrown by async children. It accepts a JSX element or a
function that receives the error and returns JSX.

```tsx twoslash kita
import { Suspense } from '@kitajs/html/suspense'

const rid = 'req-1'

async function AsyncContent() {
  return <div>Loaded content</div>
}
// ---cut---
const html = (
  <Suspense
    rid={rid}
    fallback={<div>Loading...</div>}
    catch={(error) => <div safe>Failed: {String(error)}</div>}
  >
    <AsyncContent />
  </Suspense>
)
```

Without a `catch` prop, errors propagate to the stream as an `'error'` event. Always
provide a `catch` handler in production to prevent the stream from closing unexpectedly.

## Multiple boundaries

Each Suspense boundary resolves independently. Place separate boundaries around sections
that fetch different data so they can appear as soon as their data is ready.

```tsx twoslash kita=stream
import { Suspense, renderToStream } from '@kitajs/html/suspense'

async function UserProfile({ id }: { id: string }) {
  return <div safe>User {id}</div>
}

async function ActivityFeed({ id }: { id: string }) {
  return <div safe>Feed {id}</div>
}
// ---cut---
const stream = renderToStream((rid) => (
  <html>
    <body>
      <Suspense rid={rid} fallback={<div>Loading user...</div>}>
        <UserProfile id="123" />
      </Suspense>
      <Suspense rid={rid} fallback={<div>Loading feed...</div>}>
        <ActivityFeed id="123" />
      </Suspense>
    </body>
  </html>
))
```

The same `rid` is shared across all Suspense boundaries in the same request. The stream
closes automatically when the last boundary resolves.

## Async fallbacks

The `fallback` prop can be an async component, but this blocks the entire stream until the
fallback resolves. The server will not send any HTML until the async fallback is ready.

```tsx twoslash kita=stream
import { Suspense, renderToStream } from '@kitajs/html/suspense'

async function loadTranslations() {
  return
}

async function UserProfile({ id }: { id: string }) {
  return <div safe>User {id}</div>
}
// ---cut---
async function LoadingMessage() {
  await loadTranslations()
  return <div>Loading user data...</div>
}

const stream = renderToStream((rid) => (
  <Suspense rid={rid} fallback={<LoadingMessage />}>
    <UserProfile id="123" />
  </Suspense>
))
```

The stream waits for `LoadingMessage` to resolve before sending anything to the client.
This defeats the purpose of streaming. Use synchronous fallbacks whenever possible.

If an async fallback throws an error, wrap the Suspense in an `ErrorBoundary` to handle
it. The `catch` prop only handles errors from the async children, not from the fallback
itself.
