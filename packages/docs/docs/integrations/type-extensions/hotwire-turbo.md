---
description:
  Enable typed Hotwire Turbo elements and attributes in Kita Html, including turbo-frame,
  turbo-stream, and Turbo Drive.
---

# Hotwire Turbo

Kita Html provides type definitions for [Hotwire Turbo](https://turbo.hotwired.dev/)
elements and attributes. Once enabled, `<turbo-frame>` and `<turbo-stream>` elements are
available as valid JSX with typed attributes.

## Setup

Create a `src/kita.d.ts` file in your project and add the triple-slash directive. If you
already have this file for another type extension, append the new directive to it.

```ts title="src/kita.d.ts"
/// <reference types="@kitajs/html/hotwire-turbo.d.ts" />
```

## Usage

Turbo Frames for partial page updates:

```tsx
<turbo-frame id="messages">
  <a href="/messages/expanded">Show all expanded messages in this frame.</a>
  <form action="/messages">Show response from this form within this frame.</form>
</turbo-frame>
```

Turbo Streams for targeted DOM mutations:

```tsx
<turbo-stream action="append" target="messages">
  <template>
    <div id="message-1">New message</div>
  </template>
</turbo-stream>
```

Turbo Drive attributes for controlling navigation behavior are also typed on standard HTML
elements.
