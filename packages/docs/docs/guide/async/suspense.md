# Suspense Streaming

Without Suspense, the server must wait for every async component to resolve before sending
any HTML to the client. For pages with multiple independent data sources, this means the
total response time equals the slowest component.

Suspense solves this by streaming. The server sends the page skeleton with fallback
content immediately, then streams the resolved content for each async subtree as it
becomes ready. The client replaces each fallback in place, so the page progressively fills
in without a full reload.

## How it works

A `Suspense` component wraps async children and provides a synchronous fallback. When
rendered, it returns the fallback immediately wrapped in a marker element. The async
children resolve in the background. Once resolved, the runtime pushes a `<template>`
containing the real content and a `<script>` that triggers the DOM replacement.

The client-side replacement script is injected automatically before the first Suspense
result is streamed. It reads each `<template>`, replaces the corresponding fallback
`<div>`, and processes any pending templates that arrived before their fallback was in the
DOM.

## Request isolation

Every Suspense boundary requires a `rid` (request ID) that ties it to a specific HTTP
request. This is necessary because multiple requests may be rendering concurrently, and
the global Suspense state must track which stream belongs to which request.

When using `renderToStream`, the `rid` is generated automatically and passed to your
component function. When using a [framework integration](/integrations/overview), use the
request's built-in ID (e.g. `req.id` in Fastify).

## When to use Suspense

Suspense is valuable when a page has multiple independent async sections with different
latencies. Each Suspense boundary operates independently, so a fast database query can
appear immediately while a slow API call shows its fallback. Without Suspense, the entire
page waits for the slowest operation.

For pages with a single async operation or where all data is fetched at once, a simple
`await` is sufficient and Suspense adds no benefit.
