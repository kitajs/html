---
description:
  Use async function components, understand promise propagation, and know when JSX results
  must be awaited.
---

# Async Components

A Kita Html component can be an `async` function. When it is, the JSX expression evaluates
to a `Promise<string>` instead of a `string`.

```tsx twoslash kita
import { jsx as __jsx } from '@kitajs/html/jsx-runtime'
let db = {
  async getUser(id: string): Promise<{ name: string }> {
    return { name: 'John Doe' }
  }
}

// ---cut---
async function UserCard({ id }: { id: string }) {
  const user = await db.getUser(id)
  return <div safe>User card for user: {user.name}</div>
}

const html = <UserCard id="123" />
// html is Promise<string>
```

## Promise propagation

When any child in a component tree is async, the entire parent chain becomes async
automatically. The runtime detects promises during child concatenation and wraps the
result in `Promise.all`. No manual promise handling is required at intermediate levels.

```tsx twoslash kita
async function UserCard({ id }: { id: string }) {
  return <div safe>User card for id: {id}</div>
}
// ---cut---
function Page() {
  return (
    <div>
      <UserCard id="123" />
      <p>Static content</p>
    </div>
  )
}

const html = await (<Page />)
// Page() returns Promise<string> because UserCard is async
```

This propagation is transitive. If `UserCard` is nested three levels deep, every ancestor
up to the root becomes a `Promise<string>`.

## JSX.Element type

The type `JSX.Element` is defined as `string | Promise<string>`. This reflects the reality
that any component tree may or may not contain async components. When you are certain that
a tree is fully synchronous, you can cast the result to `string`.

```tsx twoslash kita
function StaticPage() {
  return <div>Static page content</div>
}
// ---cut---
// When you know the tree is sync-only
const html = (<StaticPage />) as string
```

TypeScript cannot infer whether a component tree is synchronous or asynchronous at the
type level, because the presence of async children is a runtime property of the tree
structure. This is a known TypeScript limitation
([microsoft/TypeScript#14729](https://github.com/microsoft/TypeScript/issues/14729)).

## When to await

If you need the resolved HTML string, await the result. If you are passing it to a stream
or to a [framework integration](/integrations/overview) that handles promises, you can
pass the promise directly without awaiting.

```tsx
// Await when you need the string
const html = await (<Page />)
response.end(html)

// Pass directly when the consumer handles promises, e.g our fastify or express plugins
reply.html(<Page />)
```
