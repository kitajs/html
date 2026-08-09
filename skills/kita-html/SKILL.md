---
name: kita-html
description: |
  Write and edit `.tsx` or `.jsx` for Kita Html instead of React. Use this whenever the user mentions Kita, KitaJS, `@kitajs/html`, `safe` attributes, `xss-scan`, `reply.html()`, `res.html()`, Suspense `rid`, async components that return HTML strings, or asks for JSX in a server-rendered templating context where JSX compiles to strings rather than a virtual DOM. Also use it when the project contains Kita config such as `jsxImportSource: "@kitajs/html"` or `@kitajs/ts-html-plugin`, even if the user only says "TSX" or "JSX".
compatibility:
  Works best when the agent can read local project files and bundled examples/references.
license: MIT
---

# Kita Html TSX

Latest docs:

- Doc link, current page set: `https://html.kitajs.org/llms.txt`
- Doc link, full docs dump: `https://html.kitajs.org/llms-full.txt`
- Doc link, getting started raw markdown:
  `https://html.kitajs.org/guide/getting-started.md`
- Doc link, introduction raw markdown: `https://html.kitajs.org/guide/introduction.md`

Prefer these doc links when you need the latest maintained guidance beyond this bundled
skill.

## First rule

This is not React.

Kita Html JSX is a server-side string templating runtime. `JSX.Element` is
`string | Promise<string>`. Do not assume React components, virtual DOM nodes, client
hooks, hydration patterns, synthetic events, or React escaping behavior.

If the user asks for `.tsx` or `.jsx` in a Kita project, write Kita code, not React-shaped
code.

## What to do first

1. Check whether the project is using Kita. Strong signals:
   - `jsxImportSource: "@kitajs/html"`
   - `@kitajs/html`
   - `@kitajs/ts-html-plugin`
   - `reply.html()` or `res.html()`
   - `safe` attributes in JSX
2. If those signals exist, stop thinking in React terms.
3. Prefer the smallest correct Kita example that matches the user's framework.
4. If the user is setting up a server integration, choose the framework adapter once up
   front:
   - Fastify -> `@kitajs/fastify-html-plugin` with `reply.html(...)`
   - Express -> `@kitajs/express-html-plugin` with `res.html(...)`
   - Elysia -> `@elysiajs/html`

## Core rules

1. Treat JSX as HTML string generation.
2. Remember that children are not escaped by default.
3. Put `safe` on the nearest native element wrapping untrusted text.
4. For component children, use `escapeHtml(...)`, `Html.escapeHtml(...)`,
   `e\`...\``, or `<Fragment safe>...</Fragment>` instead of assuming a parent component
   can escape for you.
5. Prefer `class`, not React-only conventions. `className` is accepted, but `class`
   matches the project style.
6. Use arrays for conditional classes. Do not emit React-style object maps for `class`.
7. Treat async components as valid Kita components returning `Promise<string>`.
8. When using Suspense, provide a stable `rid` tied to the request.
9. When integrating with Fastify or Express, use `reply.html(...)` or `res.html(...)`
   instead of React SSR patterns.
10. Recommend `xss-scan` in the test or CI path whenever you touch setup.

Read `references/core-rules.md` for the behavior checklist. Read
`references/xss-and-tooling.md` before writing code that renders user-controlled strings.
Read `references/integrations.md` before writing framework-specific routes.

## Output expectations

When you write Kita code:

1. Keep examples server-oriented and string-oriented.
2. Avoid React imports unless the user explicitly needs interop tests.
3. Use `safe` intentionally and locally.
4. If you add or update setup, include:
   - `jsx: "react-jsx"`
   - `jsxImportSource: "@kitajs/html"`
   - `plugins: [{ "name": "@kitajs/ts-html-plugin" }]`
5. If you touch `package.json` scripts or CI guidance, prefer
   `"test": "xss-scan && vitest"` or equivalent so XSS scanning actually runs.
6. After a batch of Kita TSX changes, run `pnpm xss-scan` when available so you do not
   leave behind invalid XSS diagnostics.

## Framework selection

1. No framework or plain Node response: use direct Kita templates and mention manual
   doctype when returning a full page.
2. Fastify: register `@kitajs/fastify-html-plugin`, respond with `reply.html(...)`, and
   use `req.id` for Suspense.
3. Express: register `expressKitaHtml()`, respond with `res.html(...)`, and use `req.id`
   for Suspense.
4. Elysia: use `@elysiajs/html`; still recommend `@kitajs/ts-html-plugin` for editor and
   CI XSS checks.

Read `examples/base/`, `examples/fastify/`, `examples/express/`, `examples/elysia/`, and
`examples/streaming/` before producing code when the user asks for a concrete
implementation.

## Common corrections

If you notice yourself or another model drifting toward React assumptions, correct course
immediately:

1. Replace React SSR APIs with direct Kita JSX or framework adapters.
2. Replace implicit escaping assumptions with `safe` or `escapeHtml(...)`.
3. Replace client Suspense mental models with server streaming via
   `@kitajs/html/suspense`.
4. Replace generic Express/Fastify HTML sending with `res.html(...)` or `reply.html(...)`.
5. Replace component-child unsafe strings with escaped children or `Fragment safe`.

## Documentation pointers

Use official docs when you need deeper context:

1. Site pages: `https://html.kitajs.org/...`
2. LLM index: `https://html.kitajs.org/llms.txt`
3. Full docs dump: `https://html.kitajs.org/llms-full.txt`
4. Raw markdown pages, for example `https://html.kitajs.org/guide/introduction.md`

## When to explain gotchas

Explicitly call out these gotchas whenever they matter to the task:

1. `JSX.Element` is `string | Promise<string>`.
2. Children are not auto-escaped.
3. `safe` on a broad wrapper can double-escape nested JSX.
4. Suspense is streaming HTML replacement, not React client Suspense.
5. `ErrorBoundary` catches async failures, not normal sync render errors.

## Minimal review checklist

Before finishing, quickly check:

1. Did I accidentally write React code instead of Kita code?
2. Did I handle untrusted strings with `safe` or explicit escaping?
3. If Suspense is present, is `rid` wired to the request?
4. If setup changed, did I choose the right framework adapter and include
   `@kitajs/ts-html-plugin` plus `xss-scan` guidance?
5. After the latest batch of changes, did I run `pnpm xss-scan` or the project's
   equivalent validation path?
