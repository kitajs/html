---
description:
  How Kita Html integrates with servers and frontend libraries, including official plugins
  and opt-in HTML attribute type extensions.
---

# Integrations

Kita Html produces strings. Any framework or library that can send a string as an HTTP
response works with Kita Html without additional setup. Express, Hono, Bun's built-in
server, and AdonisJS all accept strings directly in their response methods.

Official framework plugins are available for [Fastify](/integrations/frameworks/fastify),
[Express](/integrations/frameworks/express), and
[Elysia](/integrations/frameworks/elysia), providing automatic content type headers,
doctype injection, and Suspense streaming support.

For frontend libraries that use custom HTML attributes, Kita Html provides TypeScript type
definitions that enable autocomplete and type checking for HTMX, Alpine.js, and Hotwire
Turbo attributes. These are opt-in through triple-slash directives or `tsconfig.json`
entries.
