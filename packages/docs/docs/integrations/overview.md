---
description:
  How Kita Html integrates with servers and frontend libraries, including official plugins
  and opt-in HTML attribute type extensions.
---

# Integrations

Kita Html produces strings. Any framework or library that can send a string as an HTTP
response works with Kita Html without additional setup. Express, Hono, Bun's built-in
server, and AdonisJS all accept strings directly in their response methods.

Official plugins are available for [Fastify](/integrations/frameworks/fastify) and
[Express](/integrations/frameworks/express). They set the content type header, inject the
doctype, and support Suspense streaming. [Elysia](/integrations/frameworks/elysia)
provides its own `@elysiajs/html` plugin.

For frontend libraries that use custom HTML attributes, Kita Html provides TypeScript type
definitions that enable autocomplete and type checking for HTMX, Alpine.js, and Hotwire
Turbo attributes. These are opt-in through triple-slash directives or `tsconfig.json`
entries.
