# Hotwire Turbo Integration

This project supports the usage of [Turbo Hotwire](https://turbo.hotwired.dev/). We
provide type definitions for the elements and attributes used with Turbo Hotwire.

## Setup

You can enable Hotwire Turbo type definitions in two ways:

### Per-File Setup

Add this triple slash directive to the top of your file:

```tsx
/// <reference types="@kitajs/html/hotwire-turbo.d.ts" />

const html = (
  // Type checking and intellisense for all Turbo elements
  <turbo-frame id="messages">
    <a href="/messages/expanded">Show all expanded messages in this frame.</a>
    <form action="/messages">Show response from this form within this frame.</form>
  </turbo-frame>
);
```

### Global Setup

Add the type to your `tsconfig.json` to import the types globally:

```json
{
  "compilerOptions": {
    "types": ["@kitajs/html/hotwire-turbo.d.ts"]
  }
}
```

## Full Example

```tsx
/// <reference types="@kitajs/html/hotwire-turbo.d.ts" />

import fastify from 'fastify';
import fastifyHtmlPlugin from '@kitajs/fastify-html-plugin';

const app = fastify();
app.register(fastifyHtmlPlugin);

function Layout({ children }: { children: JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Turbo Example</title>
        <script
          type="module"
          src="https://cdn.jsdelivr.net/npm/@hotwired/turbo@8.0.0/+esm"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}

app.get('/', (req, reply) => {
  reply.html(
    <Layout>
      <h1>Turbo Frame Example</h1>
      <turbo-frame id="message">
        <a href="/messages/1">Show Message</a>
      </turbo-frame>
    </Layout>
  );
});

app.get('/messages/:id', (req, reply) => {
  reply.html(
    <turbo-frame id="message">
      <h2>Message {req.params.id}</h2>
      <p>This content was loaded via Turbo Frame!</p>
      <a href="/">Back</a>
    </turbo-frame>
  );
});

await app.listen({ port: 3000 });
```

## Turbo Frames

Turbo Frames allow you to update specific parts of the page without a full reload:

```tsx
<turbo-frame id="cart">
  <p>Your cart is empty</p>
  <a href="/cart">View Cart</a>
</turbo-frame>
```

When the user clicks the link, only the content inside the `turbo-frame` with `id="cart"`
will be replaced.

### Lazy-Loaded Frames

```tsx
<turbo-frame id="messages" src="/messages/lazy">
  <p>Loading messages...</p>
</turbo-frame>
```

### Targeting Frames

```tsx
<a href="/profile" data-turbo-frame="sidebar">
  Load Profile in Sidebar
</a>

<turbo-frame id="sidebar">
  Sidebar content here
</turbo-frame>
```

## Turbo Streams

Turbo Streams provide real-time page updates:

```tsx
app.get('/updates', (req, reply) => {
  reply.type('text/vnd.turbo-stream.html');
  reply.html(
    <>
      <turbo-stream action="append" target="messages">
        <template>
          <div>New message arrived!</div>
        </template>
      </turbo-stream>
    </>
  );
});
```

### Stream Actions

```tsx
// Append content
<turbo-stream action="append" target="messages">
  <template>
    <div>New content</div>
  </template>
</turbo-stream>

// Prepend content
<turbo-stream action="prepend" target="messages">
  <template>
    <div>New content at top</div>
  </template>
</turbo-stream>

// Replace content
<turbo-stream action="replace" target="message-1">
  <template>
    <div id="message-1">Updated message</div>
  </template>
</turbo-stream>

// Remove element
<turbo-stream action="remove" target="message-1">
</turbo-stream>

// Update element
<turbo-stream action="update" target="message-1">
  <template>
    Updated content inside message-1
  </template>
</turbo-stream>
```

## Form Submissions

Turbo automatically intercepts form submissions:

```tsx
<form action="/messages" method="post">
  <input type="text" name="content" />
  <button type="submit">Send</button>
</form>
```

### Handling Form Responses

```tsx
app.post('/messages', async (req, reply) => {
  const message = await db.createMessage(req.body.content);

  reply.type('text/vnd.turbo-stream.html');
  reply.html(
    <turbo-stream action="append" target="messages">
      <template>
        <div safe id={`message-${message.id}`}>
          {message.content}
        </div>
      </template>
    </turbo-stream>
  );
});
```

## Turbo Drive

Turbo Drive intercepts all link clicks and form submissions by default:

```tsx
// Disable Turbo for specific links
<a href="/legacy" data-turbo="false">
  Legacy Page (full reload)
</a>

// Confirm before navigation
<a href="/delete" data-turbo-confirm="Are you sure?">
  Delete
</a>

// Force reload
<a href="/refresh" data-turbo-action="replace">
  Refresh
</a>
```

## Combining with Suspense

Use Turbo Frames with KitaJS Suspense for progressive enhancement:

```tsx
import { Suspense } from '@kitajs/html/suspense';

async function MessageList() {
  const messages = await db.getMessages();
  return (
    <>
      {messages.map((msg) => (
        <div id={`message-${msg.id}`} safe>
          {msg.content}
        </div>
      ))}
    </>
  );
}

app.get('/', (req, reply) => {
  reply.html(
    <Layout>
      <turbo-frame id="messages">
        <Suspense rid={req.id} fallback={<div>Loading messages...</div>}>
          <MessageList />
        </Suspense>
      </turbo-frame>
    </Layout>
  );
});
```

## Type-Safe Turbo Elements

All Turbo elements and attributes are fully typed:

```tsx
// ✓ Valid Turbo elements
<turbo-frame id="..." />
<turbo-stream action="..." target="..." />

// ✓ Valid stream actions
<turbo-stream action="append" />
<turbo-stream action="prepend" />
<turbo-stream action="replace" />
<turbo-stream action="update" />
<turbo-stream action="remove" />

// ✗ TypeScript error for invalid actions
<turbo-stream action="invalid" />
```

## Resources

- [Turbo Handbook](https://turbo.hotwired.dev/handbook/introduction)
- [Turbo Reference](https://turbo.hotwired.dev/reference/frames)
- [Hotwire Homepage](https://hotwired.dev/)

## Next Steps

- Try [HTMX integration](/integrations/htmx)
- Try [Alpine.js integration](/integrations/alpine)
- Explore [Base HTML Templates](/integrations/base-templates)
