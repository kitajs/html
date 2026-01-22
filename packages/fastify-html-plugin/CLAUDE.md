# @kitajs/fastify-html-plugin - Developer Guide

## Overview

`@kitajs/fastify-html-plugin` is a Fastify plugin that integrates `@kitajs/html` with
Fastify, providing a seamless `reply.html()` method for rendering JSX components. It
supports both synchronous and asynchronous components, including Suspense streaming.

## Architecture

### Single File Design

The entire plugin is contained in a single file (`src/index.ts`) as the integration is
straightforward:

```
src/
└── index.ts    # Plugin registration, reply decorator, Suspense integration
```

### Key Components

#### Plugin Registration

```typescript
const plugin: FastifyPluginCallback<Partial<FastifyKitaHtmlOptions>> = function (
  fastify,
  opts,
  next
) {
  fastify.decorateReply(kAutoDoctype, opts.autoDoctype ?? true);
  fastify.decorateReply('html', html);
  return next();
};
```

The plugin:

1. Decorates replies with `kAutoDoctype` symbol (configurable)
2. Adds the `html()` method to reply instances
3. Uses `fastify-plugin` for proper encapsulation

#### The `html()` Method

```typescript
function html<H extends JSX.Element>(
  this: FastifyReply,
  htmlStr: H
): H extends Promise<string> ? Promise<void> : void {
  if (typeof htmlStr === 'string') {
    return handleHtml(htmlStr, this);
  }
  return handleAsyncHtml(htmlStr, this);
}
```

Handles both sync and async JSX elements with proper TypeScript inference.

#### HTML Processing

```typescript
function handleHtml<R extends FastifyReply>(htmlStr: string, reply: R): R {
  // 1. Auto-prepend doctype for <html> tags
  if (reply[kAutoDoctype] && isTagHtml(htmlStr)) {
    htmlStr = `<!doctype html>${htmlStr}`;
  }

  // 2. Set content type
  reply.type('text/html; charset=utf-8');

  // 3. Check for Suspense usage
  const requestData = SUSPENSE_ROOT.requests.get(reply.request.id);

  if (requestData === undefined) {
    // No Suspense - send as regular response with Content-Length
    return reply
      .header('content-length', Buffer.byteLength(htmlStr, 'utf-8'))
      .send(htmlStr);
  }

  // Suspense detected - stream the response
  return reply.send(resolveHtmlStream(htmlStr, requestData));
}
```

### Suspense Integration

The plugin automatically detects Suspense usage via the global `SUSPENSE_ROOT`:

1. When `<Suspense rid={req.id}>` is used, it registers in `SUSPENSE_ROOT.requests`
2. The plugin checks for this registration using `reply.request.id`
3. If found, it streams the response using `resolveHtmlStream()`
4. No manual stream handling required by the user

### Configuration

```typescript
export interface FastifyKitaHtmlOptions {
  /**
   * Auto-prepend <!doctype html> to responses starting with <html>
   *
   * @default true
   */
  autoDoctype: boolean;
}
```

The `kAutoDoctype` symbol is exposed so users can disable auto-doctype per-request:

```typescript
reply[kAutoDoctype] = false;
reply.html(<html>...</html>);  // No doctype added
```

## Module Augmentation

The plugin extends Fastify's types:

```typescript
declare module 'fastify' {
  interface FastifyReply {
    [kAutoDoctype]: boolean;
    html<H extends JSX.Element>(
      this: this,
      html: H
    ): H extends Promise<string> ? Promise<void> : void;
  }
}
```

## Export Patterns

Multiple export styles are supported for maximum compatibility:

```typescript
// Named export
export const fastifyKitaHtml = Object.assign(plugin_, { kAutoDoctype });

// Default export
export default fastifyKitaHtml;

// Usage examples:
// const fastifyKitaHtml = require('@kitajs/fastify-html-plugin')
// const { fastifyKitaHtml } = require('@kitajs/fastify-html-plugin')
// import fastifyKitaHtml from '@kitajs/fastify-html-plugin'
// import { fastifyKitaHtml } from '@kitajs/fastify-html-plugin'
```

## Development

### Building

```bash
pnpm build  # Compiles TypeScript with tsgo
```

### Testing

```bash
pnpm test  # Runs vitest with coverage and type checking
```

### Dependencies

- **`fastify-plugin`**: Enables proper plugin encapsulation
- **Peer deps**: `@kitajs/html`, optionally `@kitajs/ts-html-plugin`

## Usage Patterns

### Basic Usage

```typescript
import fastifyKitaHtml from '@kitajs/fastify-html-plugin';

app.register(fastifyKitaHtml);

app.get('/', (req, reply) => {
  reply.html(
    <html>
      <body>Hello World</body>
    </html>
  );
});
```

### With Suspense

```typescript
app.get('/stream', (req, reply) => {
  reply.html(
    <Suspense rid={req.id} fallback={<div>Loading...</div>}>
      <AsyncComponent />
    </Suspense>
  );
});
```

Key point: Use `req.id` as the Suspense `rid` - this is how the plugin matches the request
to its Suspense data.

### Async Components

```typescript
app.get('/async', async (req, reply) => {
  // Await is optional - html() handles promises
  reply.html(<AsyncPage />);
});
```

### Disabling Auto-Doctype

```typescript
// Per-request
app.get('/fragment', (req, reply) => {
  reply[kAutoDoctype] = false;
  reply.html(<div>Just a fragment</div>);
});

// Globally
app.register(fastifyKitaHtml, { autoDoctype: false });
```

## Key Patterns

### HTML Tag Detection

```typescript
const isTagHtml = RegExp.prototype.test.bind(/^\s*<html/i);
```

Uses bound regex test for performance - no new function allocation per call.

### Async Handler Separation

```typescript
// Sync path (optimized)
function handleHtml(htmlStr: string, reply: FastifyReply) { ... }

// Async path (separate function avoids async overhead in sync case)
async function handleAsyncHtml(promise: Promise<string>, reply: FastifyReply) {
  return handleHtml(await promise, reply);
}
```

This pattern allows V8 to optimize the sync path without async function overhead.

### Content-Length Handling

```typescript
// Without Suspense: set Content-Length for proper HTTP
reply.header('content-length', Buffer.byteLength(htmlStr, 'utf-8'));

// With Suspense: omit Content-Length (chunked transfer)
// Per RFC 7230 section 3.3.3, connection is closed after response
```

## Common Gotchas

1. **Suspense requires `req.id`**: Must use `rid={req.id}` for Suspense to work
2. **Auto-doctype only for `<html>` tags**: Fragments won't get doctype
3. **Charset is important**: `text/html; charset=utf-8` prevents UTF-7 XSS attacks
4. **Fastify version**: Works with Fastify 4.x and 5.x
