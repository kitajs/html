# Kita Html Examples

Real-world examples demonstrating how to use Kita Html to build server-rendered
applications with JSX.

## What is Kita Html?

Kita Html is a super-fast JSX runtime that generates HTML strings directly, without a
virtual DOM. Perfect for server-side rendering, static site generation, HTMX applications,
and streaming HTML with Suspense.

## Running Examples

Each example directory contains its own `package.json`. To run an example:

```bash
cd examples/<example-name>
pnpm install
pnpm dev
```

Check each example's directory for specific details and implementation patterns.

Featured examples:

- `h3-signal-room` streams independent environmental readings through H3.
- `nitro-night-atlas` demonstrates convention pages, dynamic routes, route groups, and a
  catch-all Nitro renderer.

## Documentation

Learn more about the packages used in these examples:

- **[@kitajs/html](../packages/html/README.md)** - Core JSX runtime, async components,
  Suspense
- **[@kitajs/ts-html-plugin](../packages/ts-html-plugin/README.md)** - XSS detection and
  prevention
- **[@kitajs/fastify-html-plugin](../packages/fastify-html-plugin/README.md)** - Fastify
  integration
- **[@kitajs/h3-html-plugin](../packages/h3-html-plugin/README.md)** - H3 responses and
  factory-safe Suspense
- **[@kitajs/nitro-html-plugin](../packages/nitro-html-plugin/README.md)** - Nitro v3 page
  conventions and renderer integration

## Getting Help

- 💬 [Discord Community](https://kitajs.org/discord)
- 🐛 [GitHub Issues](https://github.com/kitajs/html/issues)
- 📚 [Full Documentation](https://github.com/kitajs/html)
