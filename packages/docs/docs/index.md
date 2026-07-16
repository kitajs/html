---
pageType: home
title: Kita Html
description:
  Fast server-side JSX runtime with compile-time XSS protection, async components, and
  Suspense streaming.
titleSuffix: Super-fast JSX Runtime

hero:
  name: Kita Html
  text: The fastest server-side JSX runtime
  tagline:
    JSX that compiles to plain strings, not a virtual DOM. <br/> No diffing, no
    serialization, no overhead.
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
      No virtual DOM means no object tree in memory. Rendering a 170 KiB page runs 2-3x
      faster than React, Preact, and HonoJsx while allocating about half the memory, all
      with identical output.
    icon: ⚡

  - title: Compile-Time XSS Detection
    details:
      The TypeScript plugin flags unsafe string interpolations in your editor. The
      xss-scan CLI enforces the same checks in CI, with no runtime penalty on safe paths.
    icon: 🛡️

  - title: Async Components and Streaming
    details:
      Async children automatically make their parents async. Suspense streams HTML via
      chunked transfer encoding, sending a fallback instantly and replacing it when the
      promise resolves.
    icon: 🔄

  - title: Built for HTML Output
    details:
      Kita Html is at its best when the result you need is HTML, like SSR pages,
      HTMX-style apps, email templates, static HTML, and HTTP handlers that return strings
      directly.
    icon: 📦

  - title: Full HTML Type Coverage
    details:
      Complete JSX type definitions for every HTML5 element and attribute. HTMX,
      Alpine.js, and Hotwire Turbo type extensions are included and opt-in via
      triple-slash directives.
    icon: 🎯

  - title: Works Anywhere You Return HTML
    details:
      The output is a plain string. Kita Html integrates with Fastify, Express, Hono, Bun,
      or any server that returns strings. If your stack can send HTML, it can use Kita
      Html.
    icon: 🔌
---
