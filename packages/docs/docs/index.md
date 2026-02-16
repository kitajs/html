---
pageType: home
title: Kita Html
titleSuffix: Super-fast JSX Runtime

hero:
  name: Kita Html
  text: The fastest server-side JSX runtime
  tagline: Just like your usual template engine, but just better!
  actions:
    - theme: brand
      text: Introduction
      link: /guide/introduction
    - theme: alt
      text: Quick Start
      link: /guide/getting-started

features:
  - title: Super Fast
    details:
      Optimized string concatenation that outperforms most JSX runtimes. 10-40x faster
      than React's renderToStaticMarkup. Built for speed without sacrificing developer
      experience.
    icon: ⚡

  - title: XSS Protection
    details:
      Built-in TypeScript plugin that catches XSS vulnerabilities at compile-time. Your
      code editor will warn you before XSS makes it to production.
    icon: 🛡️

  - title: Async Components
    details:
      Full support for async/await with Suspense streaming. Start sending HTML to the
      client while async operations complete in the background.
    icon: 🔄

  - title: Zero Dependencies
    details:
      Lightweight runtime with zero dependencies. Perfect for serverless and edge
      environments where bundle size matters.
    icon: 📦

  - title: Type Safe
    details:
      Full TypeScript support with JSX type definitions for all HTML elements and
      attributes, plus HTMX, Alpine.js, and Hotwire Turbo.
    icon: 🎯

  - title: Framework Agnostic
    details:
      Works with Fastify, Express, Hono, Bun, or any framework that handles strings. If it
      works with strings, it works with Kita Html.
    icon: 🔌
---
