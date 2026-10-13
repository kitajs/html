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

## Documentation

Learn more about the packages used in these examples:

- **[@kitajs/html](../packages/html/README.md)** - Core JSX runtime, async components,
  Suspense
- **[@kitajs/html-cli](../packages/cli/README.md)** - `kita-html check`, XSS detection for
  TypeScript 7.1+
- **[@kitajs/fastify-html-plugin](../packages/fastify-html-plugin/README.md)** - Fastify
  integration

## Getting Help

- 💬 [Discord Community](https://kitajs.org/discord)
- 🐛 [GitHub Issues](https://github.com/kitajs/html/issues)
- 📚 [Full Documentation](https://github.com/kitajs/html)
