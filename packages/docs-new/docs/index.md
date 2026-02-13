---
pageType: home
title: KitaJS Html
titleSuffix: Super-fast JSX Runtime

hero:
  name: KitaJS Html
  text: The fastest server-side JSX runtime
  tagline: Just like your usual template engine, but just better!
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/kitajs/html

features:
  - title: Super Fast
    details: Optimized string concatenation that outperforms most JSX runtimes. 10-40x faster than React's renderToStaticMarkup. Built for speed without sacrificing developer experience.
    icon: ⚡

  - title: XSS Protection
    details: Built-in TypeScript plugin that catches XSS vulnerabilities at compile-time. Your code editor will warn you before XSS makes it to production.
    icon: 🛡️

  - title: Async Components
    details: Full support for async/await with Suspense streaming. Start sending HTML to the client while async operations complete in the background.
    icon: 🔄

  - title: Zero Dependencies
    details: Lightweight runtime with zero dependencies. Perfect for serverless and edge environments where bundle size matters.
    icon: 📦

  - title: Type Safe
    details: Full TypeScript support with JSX type definitions for all HTML elements and attributes, plus HTMX, Alpine.js, and Hotwire Turbo.
    icon: 🎯

  - title: Framework Agnostic
    details: Works with Fastify, Express, Hono, Bun, or any framework that handles strings. If it works with strings, it works with KitaJS Html.
    icon: 🔌
---

## Quick Example

```tsx
// this is true
typeof (<div>hello</div>) === 'string';

// Simply write JSX and use it anywhere
import fs from 'node:fs';

fs.writeFileSync(
  'index.html',
  <p>
    Hello, <strong>world</strong>!
  </p>
);
```

## Why KitaJS Html?

Unlike React which builds a virtual DOM, KitaJS Html directly produces HTML strings, making it **perfect for server-side rendering**. It's the fastest way to generate HTML on the server while maintaining the familiar JSX syntax you already know.

**Key Benefits:**

- 🚀 **10-40x faster** than React's `renderToStaticMarkup`
- 🔒 **Compile-time XSS detection** catches vulnerabilities before deployment
- ⚡ **Streaming support** with Suspense for progressive rendering
- 🎨 **Familiar JSX syntax** - no new templating language to learn
- 🛠️ **Full TypeScript support** with autocomplete for HTML, HTMX, and more

Ready to get started? Check out our [Getting Started guide](/guide/getting-started)!
