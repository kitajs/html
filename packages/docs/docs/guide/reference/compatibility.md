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
definitions. TypeScript 7.1 or later is recommended, because XSS detection on TypeScript 7
uses the API that ships with 7.1.

| TypeScript  | XSS tooling                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------- |
| 7.1 and up  | [`kita-html check`](/guide/xss/cli-scanner) from `@kitajs/html-cli`                                |
| 7.0         | None. Version 7.0 ships no compiler API                                                            |
| 5.x and 6.x | Deprecated [editor plugin and `xss-scan`](/guide/xss/ts-html-plugin) from `@kitajs/ts-html-plugin` |

`@kitajs/html-cli` requires Node.js 22 or later.

## Module system

The packages emit CommonJS. ESM consumers can import them with `esModuleInterop` enabled
in `tsconfig.json`.

## Frameworks

Official [framework integrations](/integrations/overview) exist for Fastify (4.x and 5.x)
and Express (4.x and 5.x). Elysia supports Kita Html through `@elysiajs/html`. Kita Html
also works with any framework that accepts strings: Hono, Bun's built-in server, AdonisJS,
and others. Send the string or stream directly in the response body.

## Browsers

The core HTML string output works anywhere the browser can render HTML. Suspense streaming
has a stricter client requirement because the injected replacement script depends on
`HTMLTemplateElement.content` and `Element.remove()`.

In practice, Suspense streaming supports modern evergreen browsers released since
late 2015. IE11 is not supported.

## Editors

TypeScript 7 does not load language service plugins, so `kita-html check` runs as a
command. Its `tsc` output format feeds any editor that parses `tsc` output, such as VS
Code through the `$tsc` problem matcher. The deprecated TypeScript 5 and 6 plugin works in
editors that support language service plugins, with the workspace TypeScript selected.
