# Fastify Integration

The `@kitajs/fastify-html-plugin` provides seamless integration with Fastify, adding a
convenient `reply.html()` method that handles both synchronous and asynchronous
components, including Suspense streaming.

## Installation

```bash
npm install @kitajs/fastify-html-plugin
```

:::danger XSS Warning You **must have followed** the `@kitajs/html`'s
[Getting Started guide](/guide/getting-started) before continuing, otherwise you will be
vulnerable to XSS attacks. :::

## Basic Setup

```typescript
import fastifyHtmlPlugin from '@kitajs/fastify-html-plugin';
import fastify from 'fastify';

const app = fastify();

app.register(fastifyHtmlPlugin);

app.get('/', (req, reply) => {
  reply.html(
    <html lang="en">
      <body>
        <h1>Hello, world!</h1>
      </body>
    </html>
  );
});

await app.listen({ port: 3000 });
```

## Configuration

The plugin accepts the following options:

| Name          | Description                                                                                        | Default |
| ------------- | -------------------------------------------------------------------------------------------------- | ------- |
| `autoDoctype` | Whether to automatically add `<!doctype html>` to a response starting with `<html>`, if not found. | `true`  |

```typescript
app.register(fastifyHtmlPlugin, {
  autoDoctype: true
});
```

### Disabling Auto-Doctype Per Request

You can disable the auto-doctype feature per request using the exported `kAutoDoctype`
symbol:

```typescript
import { kAutoDoctype } from '@kitajs/fastify-html-plugin';

app.get('/fragment', (req, reply) => {
  reply[kAutoDoctype] = false;
  return reply.html(<div>Just a fragment, no doctype needed</div>);
});
```

## Using reply.html()

The `reply.html()` method supports all types of components:

### Synchronous Components

```typescript
app.get('/sync', (req, reply) => {
  reply.html(
    <div>
      <h1>Hello</h1>
      <p>This is synchronous content</p>
    </div>
  );
});
```

### Asynchronous Components

```typescript
async function AsyncUser({ id }: { id: string }) {
  const user = await database.getUser(id);
  return <div safe>{user.name}</div>;
}

app.get('/user/:id', (req, reply) => {
  reply.html(<AsyncUser id={req.params.id} />);
});
```

### Suspense Streaming

The plugin automatically detects when you use Suspense components and streams the
response:

```typescript
import { Suspense } from '@kitajs/html/suspense';

async function AsyncContent() {
  const data = await fetch('https://api.example.com/data');
  return <div>{await data.text()}</div>;
}

app.get('/stream', (req, reply) => {
  reply.html(
    <html>
      <body>
        <Suspense rid={req.id} fallback={<div>Loading...</div>}>
          <AsyncContent />
        </Suspense>
      </body>
    </html>
  );
});
```

:::tip Important When using Suspense, you **must** use `req.id` as the `rid` parameter.
This is how the plugin matches the request to its Suspense data. :::

## How It Works

The plugin:

1. Decorates `reply` with the `html()` method
2. Automatically adds `<!doctype html>` for responses starting with `<html>`
   (configurable)
3. Sets the correct `Content-Type` header (`text/html; charset=utf-8`)
4. Detects Suspense usage and automatically streams the response
5. Sets `Content-Length` for non-streaming responses

### Streaming Detection

The plugin checks for Suspense usage via the global `SUSPENSE_ROOT`:

- When `<Suspense rid={req.id}>` is used, it registers in the suspense root
- The plugin detects this registration using `reply.request.id`
- If found, it streams the response using chunked transfer encoding
- No manual stream handling required!

## Type Safety

The plugin extends Fastify's types to provide full TypeScript support:

```typescript
import { FastifyReply } from 'fastify';

// reply.html() is fully typed
reply.html(<div>Hello</div>); // ✓

// Async components are handled correctly
reply.html(<AsyncComponent />); // ✓

// Type errors for invalid JSX
reply.html(<div invalid-prop />); // ✗ TypeScript error
```

## Complete Example

```tsx
import fastifyHtmlPlugin from '@kitajs/fastify-html-plugin';
import { Suspense } from '@kitajs/html/suspense';
import fastify from 'fastify';

const app = fastify();

app.register(fastifyHtmlPlugin);

// Layout component
function Layout({ children }: { children: JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>My App</title>
      </head>
      <body>{children}</body>
    </html>
  );
}

// Async data component
async function UserData({ id }: { id: string }) {
  const user = await db.getUser(id);
  return (
    <div>
      <h2 safe>{user.name}</h2>
      <p safe>{user.email}</p>
    </div>
  );
}

// Route with Suspense streaming
app.get('/user/:id', (req, reply) => {
  reply.html(
    <Layout>
      <h1>User Profile</h1>
      <Suspense rid={req.id} fallback={<div>Loading user...</div>}>
        <UserData id={req.params.id} />
      </Suspense>
    </Layout>
  );
});

await app.listen({ port: 3000 });
```

## Compatibility

This plugin is compatible with **Fastify 4.x** and **Fastify 5.x**.

## Next Steps

- Learn about [Suspense streaming](/guide/features/async-components)
- Integrate with [HTMX](/integrations/libraries/htmx)
- Add [Alpine.js](/integrations/libraries/alpine) support
