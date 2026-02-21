# Streaming Internals

This page describes how Suspense streaming works at the protocol level, from the initial
HTML response to the client-side DOM replacement.

## Initial response

When `renderToStream` produces the initial HTML, each Suspense boundary renders its
fallback content wrapped in a `<div>` with a `data-sf` attribute and a unique ID derived
from the boundary's run number.

```html
<div id="B:1" data-sf>Loading...</div>
```

This div is part of the initial HTML chunk sent to the client. The browser renders it
immediately.

## Async resolution

When an async child resolves, the runtime pushes two elements to the stream: a
`<template>` containing the resolved HTML and a `<script>` that triggers the replacement.

```html
<template id="N:1" data-sr><div>Actual content</div></template>
<script id="S:1" data-ss>
  $KITA_RC(1);
</script>
```

The `<template>` is inert, the browser does not render its content. The `<script>`
executes immediately when the browser receives it, calling the replacement function.

## Client-side replacement

The `$KITA_RC` function is a small script injected before the first Suspense result. It
finds the fallback div by ID, extracts the template's content into a document fragment,
and replaces the div with the fragment. It then removes the template and script elements
from the DOM.

After each replacement, the function scans for any pending templates whose fallback divs
were not yet in the DOM when they arrived. This handles cases where a fast async boundary
resolves before the initial HTML containing its fallback has been parsed.

## HTTP transfer

The response uses chunked transfer encoding. The initial HTML is the first chunk. Each
resolved Suspense boundary produces an additional chunk. The response has no
`Content-Length` header, so the connection remains open until the last boundary resolves
and the stream is closed.

Runtimes like Node.js and Bun handle chunked encoding automatically when data is written
to the response without a content-length header.
