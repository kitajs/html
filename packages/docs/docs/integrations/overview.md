# Integrations Overview

As Kita/Html is a simple JSX template that resolves into raw HTML strings, almost every
project out there can be integrated with it.

## Framework Integrations

<div class="integration-grid">

### [Fastify](/integrations/frameworks/fastify)

Official Fastify plugin with seamless `reply.html()` support and Suspense streaming.

### [Express](https://expressjs.com)

Works with any Express setup by sending HTML strings in responses.

### [Hono](https://hono.dev)

Perfect for edge runtimes and serverless environments.

### [Bun](https://bun.sh)

Native Bun support with optimized performance.

</div>

## Frontend Library Integrations

<div class="integration-grid">

### [HTMX](/integrations/libraries/htmx)

Full type definitions for all HTMX attributes.

### [Alpine.js](/integrations/libraries/alpine)

Complete type support for Alpine.js directives.

### [Hotwire Turbo](/integrations/libraries/turbo)

Type definitions for Turbo elements and attributes.

</div>

## Migrating from Raw HTML Templates

Migrating from plain HTML to JSX can be a pain to convert it all manually, as you will
find yourself hand placing quotes and closing void elements.

You can use [**Html To Jsx**](https://magic.reactjs.net/htmltojsx.htm) to convert HTML to
JSX automatically.

### Example Conversion

**HTML Input:**

```html
<!-- Hello world -->
<div class="awesome" style="border: 1px solid red">
  <label for="name">Enter your name: </label>
  <input type="text" id="name" />
</div>
<p>Enter your HTML here</p>
```

**JSX Output:**

```tsx
<>
  {/* Hello world */}
  <div className="awesome" style={{ border: '1px solid red' }}>
    <label htmlFor="name">Enter your name: </label>
    <input type="text" id="name" />
  </div>
  <p>Enter your HTML here</p>
</>
```

## Universal Compatibility

Since KitaJS Html generates plain HTML strings, it works with **any** framework or library
that accepts strings:

```tsx
// Works everywhere!
const html = <div>Hello World</div>;
console.log(typeof html); // "string"

// Use it anywhere
response.send(html);
res.write(html);
return new Response(html);
// ... and more!
```

## Next Steps

- Learn about [Fastify integration](/integrations/frameworks/fastify)
- Add [HTMX support](/integrations/libraries/htmx)
- Configure [Base HTML Templates](/integrations/libraries/base-templates)
