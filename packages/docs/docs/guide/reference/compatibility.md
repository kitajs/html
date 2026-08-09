---
description:
  Runtime, TypeScript, module, framework, browser, and editor compatibility requirements
  for Kita Html.
---

# Compatibility

## Runtimes

Kita Html works on Node.js 20.13 and later. Bun is fully supported and uses its native
`Bun.escapeHTML` for faster escaping. Deno is untested but expected to work since the
library has no native dependencies.

## TypeScript

TypeScript 6.0 or later is required for full compatibility with the latest type
definitions.

The native TypeScript compiler `tsgo` works for building projects that use Kita Html. The
language service plugin (`@kitajs/ts-html-plugin`) requires the standard TypeScript
language server and will not work with `tsgo` while
[`tsgo` doesn't publish its own support for plugins](https://github.com/microsoft/typescript-go#what-works-so-far).

## Module system

The packages emit CommonJS. ESM consumers can import them with `esModuleInterop` enabled
in `tsconfig.json`.

## Frameworks

Official [framework integrations](/integrations/overview) exist for Fastify (4.x and 5.x),
Express (4.x and 5.x), and Elysia. Kita Html also works with any framework that accepts
strings: Hono, Bun's built-in server, AdonisJS, and others. Send the string or stream
directly in the response body.

## Browsers

The core HTML string output works anywhere the browser can render HTML. Suspense streaming
has a stricter client requirement because the injected replacement script depends on
`HTMLTemplateElement.content` and `Element.remove()`.

In practice, Suspense streaming supports modern evergreen browsers released since
late 2015. IE11 is not supported.

## Editors

The XSS detection plugin works in any editor that supports TypeScript language service
plugins. VS Code requires the workspace TypeScript to be selected instead of the built-in
version.
