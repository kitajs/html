---
pageType: home
title: Kita Html
description:
  Fast server-side JSX runtime with compile-time XSS protection, async components, and
  Suspense streaming.
titleSuffix: Server-side JSX runtime

hero:
  name: Kita Html
  text: The fastest server-side JSX runtime
  tagline:
    JSX that compiles to plain strings, not a virtual DOM. <br/> No diffing and no
    serialization.
  actions:
    - theme: brand
      text: Introduction
      link: /guide/introduction
    - theme: alt
      text: Quick start
      link: /guide/getting-started

features:
  - title: Fast JSX runtime
    details:
      No virtual DOM means no object tree in memory. Rendering a 170 KiB page runs 2-3x
      faster than React, Preact, and HonoJsx and allocates 40-50% less memory. The output
      is identical.
    icon: ⚡

  - title: Compile-time XSS detection
    details:
      kita-html check uses the TypeScript 7.1 type checker to flag unsafe string
      interpolations in CI and editor problem panels. The checks run at compile time and
      add no runtime cost.
    icon: 🛡️

  - title: Async components and streaming
    details:
      Async children automatically make their parents async. Suspense streams HTML via
      chunked transfer encoding, sending a fallback instantly and replacing it when the
      promise resolves.
    icon: 🔄

  - title: Built for HTML output
    details:
      Kita Html is at its best when the result you need is HTML, like SSR pages,
      HTMX-style apps, email templates, static HTML, and HTTP handlers that return strings
      directly.
    icon: 📦

  - title: Full HTML type coverage
    details:
      JSX type definitions for HTML elements and attributes. HTMX, Alpine.js, and Hotwire
      Turbo type extensions are included and opt-in via triple-slash directives.
    icon: 🎯

  - title: Works with any server
    details:
      The output is a plain string. Kita Html integrates with Fastify, Express, Hono, Bun,
      or any server that returns strings.
    icon: 🔌
---
