---
pageType: home
title: Kita Html
titleSuffix: Super-fast JSX Runtime

hero:
  name: Kita Html
  text: The fastest server-side JSX runtime
  tagline:
    JSX that compiles to plain strings, not a virtual DOM. No diffing, no serialization,
    no overhead.
  actions:
    - theme: brand
      text: Introduction
      link: /guide/introduction
    - theme: alt
      text: Quick Start
      link: /guide/getting-started

features:
  - title: The Fastest JSX Runtime
    details:
      No virtual DOM means no object tree sitting in memory. Rendering a 170 KiB page runs
      2-3x faster than React, Preact, and HonoJsx, while allocating half the memory, all
      producing identical output.
    icon: ⚡

  - title: Compile-Time XSS Detection
    details:
      The TypeScript plugin flags unsafe string interpolations in your editor as you type.
      The xss-scan CLI blocks them in CI. Vulnerabilities caught before they reach
      production, with no runtime penalty on safe paths.
    icon: 🛡️

  - title: Async and Streaming
    details:
      Async children automatically make their parents async. Suspense streams HTML via
      chunked transfer encoding, sending a fallback instantly and replacing it when the
      promise resolves.
    icon: 🔄

  - title: Zero Dependencies
    details:
      The runtime ships with no dependencies. Small, predictable footprint for serverless
      functions, edge runtimes, and any environment where cold-start latency matters.
    icon: 📦

  - title: Type Safe
    details:
      Complete JSX type definitions for every HTML5 element and attribute. HTMX,
      Alpine.js, and Hotwire Turbo type extensions are included and opt-in via
      triple-slash directives.
    icon: 🎯

  - title: Framework Agnostic
    details:
      The output is a plain string. Kita Html integrates with Fastify, Express, Hono, Bun,
      or any server that returns strings. If it works with strings, it works with Kita
      Html.
    icon: 🔌
---
