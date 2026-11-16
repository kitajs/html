# @kitajs/express-html-plugin - Developer Guide

## Overview

`@kitajs/express-html-plugin` is a thin Express middleware that integrates `@kitajs/html`
with Express. It provides `res.html()` for buffered and streamed HTML responses and
assigns a stable `req.id` for Suspense when Express does not already have one.

## Architecture

The package mirrors the Fastify adapter shape with three small source files:

- `src/plugin.ts` registers request and response decorations
- `src/html.ts` handles sync, async, and Suspense responses
- `src/utils.ts` exposes the doctype symbol and root-tag detection

## Key Rules

- Keep the adapter thin. Framework glue belongs here. Rendering belongs in `@kitajs/html`.
- `req.id` must stay stable for the life of the request because Suspense uses it as the
  request key.
- Preserve user-provided `req.id` values. Only generate ids when Express has none.
- The default id generator uses `req-<base36 counter>` ids.
- `disableRequestId` exists for apps that already assign request ids elsewhere.
- `res.html()` is responsible for content type, content length, transfer encoding, and
  doctype injection.
- Do not add framework-agnostic helpers here. If behavior belongs in the runtime, change
  `@kitajs/html` instead.
