# Kita Html - Complete Project Reference

## Identity

- **Name**: Kita Html
- **npm scope**: `@kitajs/html`
- **Website**: https://html.kitajs.org
- **Repo**: https://github.com/kitajs/html
- **Author**: Arthur Fiorette (3+ year project)
- **License**: MIT
- **Package Manager**: pnpm (required)
- **Build Tool**: tsgo (TypeScript native compiler preview)
- **Test Runner**: Vitest
- **Formatter**: Prettier
- **Doc Framework**: Rspress (VitePress-like, React-based)

## What It Is

A JSX runtime that produces HTML strings instead of a virtual DOM. `<div />` literally
equals `'<div></div>'`. Designed for server-side rendering, static site generation, and
HTMX-style apps where strings are the ideal output format. Uses standard JSX syntax
(`jsx: "react-jsx"`, `jsxImportSource: "@kitajs/html"`) but the runtime returns strings.

Core value proposition: JSX DX with string output performance. No client-side reactivity,
no virtual DOM diffing.

## Monorepo Structure

```
packages/
  html/                  # Core JSX runtime (@kitajs/html)
  ts-html-plugin/        # XSS detection TS plugin + CLI (@kitajs/ts-html-plugin)
  fastify-html-plugin/   # Fastify integration (@kitajs/fastify-html-plugin)
  docs/                  # Documentation site (Rspress)
benchmarks/              # Performance benchmarks
examples/
  fastify-htmx/          # Fastify + HTMX interactive dashboard demo
  http-server/           # Plain Node.js HTTP server with Suspense streaming
```

## Package: @kitajs/html (Core)

### Key Files

- `src/index.ts` - Core: escapeHtml, attributesToString, contentsToString,
  contentToString, createElement, Fragment, isVoidElement, toKebabCase, styleToString
- `src/jsx-runtime.ts` - Modern JSX transform: jsx(), jsxs(), Fragment
- `src/jsx-dev-runtime.ts` - Development JSX transform (adds jsxDEV)
- `src/jsx.ts` - Global JSX namespace type definitions
- `src/suspense.ts` - Suspense component, renderToStream, resolveHtmlStream,
  SuspenseScript
- `src/error-boundary.ts` - ErrorBoundary component, HtmlTimeout error class

### Type System

- `JSX.Element = string | Promise<string>` - elements are always strings
- `PropsWithChildren<T>` - component props with children
- `Html.Children` - safe children type alias
- `JSX.IntrinsicElements` - all HTML elements typed
- `JSX.HtmlTag` - base interface with common attributes including `safe`

### Core Behavior

- **No Virtual DOM**: JSX compiles to string concatenation
- **Async Propagation**: If any child is a Promise, the parent becomes a Promise
- **Attributes**: Always escaped by default
- **Children**: NOT escaped by default (this is the XSS concern)
- **`safe` attribute**: `<div safe>{input}</div>` escapes children
- **Void elements**: Self-closing tags detected by `isVoidElement()` (meta, link, img, br,
  input, etc.)
- **Conditional classes**: `class={['a', condition && 'b', 'c']}` filters falsy values

### Performance Optimizations

1. Check before convert (regex test before expensive ops)
2. Character-by-character loops faster than regex for escaping
3. Escape once at the end, not individual pieces
4. Void element check ordered by frequency
5. Bun detection: uses native `Bun.escapeHTML` when available

### Suspense System

1. `<Suspense rid={rid} fallback={<Loading />} catch={errorHandler}>` renders fallback
   immediately
2. Async children processed in background
3. When resolved, `<template data-sr>` + `<script data-ss>` streamed to client
4. Client-side script `$KITA_RC` replaces fallback div with real content
5. `renderToStream(html, rid?)` returns a Readable stream
6. `resolveHtmlStream(template, requestData)` is the internal helper (used by fastify
   plugin)
7. Global `SUSPENSE_ROOT` tracks all active requests via Map<rid, RequestData>
8. RequestData: `{ sent: boolean, running: number, stream: Readable }`

### ErrorBoundary

- Catches errors in async component trees
- Props: `children`, `catch` (element or function), `timeout` (ms), `error` (custom class)
- `HtmlTimeout` error class for timeout failures
- Only works for async components; sync errors need try/catch

### Additional Type Extensions

- `htmx.d.ts` - HTMX attributes
- `alpine.d.ts` - Alpine.js directives
- `hotwire-turbo.d.ts` - Hotwire Turbo elements/attributes
- `all-types.d.ts` - Allow any tag/attribute (not recommended)

### Serialization Table

| Input           | Output     |
| --------------- | ---------- |
| `{"abc"}`       | `abc`      |
| `{10}`          | `10`       |
| `{NaN}`         | `NaN`      |
| `{Infinity}`    | `Infinity` |
| `{true}`        | `true`     |
| `{false}`       | `false`    |
| `{null}`        | (empty)    |
| `{undefined}`   | (empty)    |
| `{[1,2,3]}`     | `123`      |
| `{BigInt(123)}` | `123`      |

## Package: @kitajs/ts-html-plugin (XSS Detection)

### Dual Mode

1. **LSP Mode**: TypeScript Language Service Plugin - real-time editor diagnostics
2. **CLI Mode**: `xss-scan` command for CI/CD

### Error Codes

| Code | Severity | Description                                           |
| ---- | -------- | ----------------------------------------------------- |
| K601 | Error    | XSS-prone content without `safe` attribute            |
| K602 | Error    | Double escaping (safe + inner JSX children)           |
| K603 | Error    | XSS in component children (needs `Html.escapeHtml()`) |
| K604 | Warning  | Unnecessary `safe` attribute on safe content          |

### Safety Detection Algorithm

Content is SAFE if:

- `children` prop from `PropsWithChildren`
- Variable initialized with JSX
- Type is `JSX.Element` alias
- Type is `Html.Children` alias
- Non-string primitive (number, boolean, bigint)
- Variable name starts with `safe`
- Result of `escapeHtml()` / `e` / `escape` call
- Union where ALL members are safe

Content is UNSAFE if:

- Type is `string` (dynamic)
- Type is `any`
- Objects with `toString()`

### Suppression Techniques

1. `safe` attribute: `<div safe>{content}</div>`
2. Safe variable prefix: `const safeContent = content;`
3. Cast: `{content as 'safe'}`
4. Escape call: `{Html.escapeHtml(content)}`

### CLI

```
xss-scan [options] <file>...
  --cwd <path>          Working directory
  -p, --project <path>  tsconfig.json path
  -s, --simplified      Simplified diagnostics
Exit codes: 0 (clean), 1 (errors), 2 (warnings only)
```

### Special Cases

- Script tag content exempt from checking
- Both ternary branches checked
- `any` type never safe
- Component vs element detection based on tag name casing (uppercase = component)

## Package: @kitajs/fastify-html-plugin (Fastify Integration)

### Single file: src/index.ts

### API

- `reply.html(element)` - renders JSX, returns void (sync) or Promise<void> (async)
- `kAutoDoctype` symbol - per-request doctype control
- Auto-prepends `<!doctype html>` for `<html>` tags (configurable)
- Sets `text/html; charset=utf-8` content type
- Auto-detects Suspense via `SUSPENSE_ROOT.requests.get(reply.request.id)`
- Without Suspense: sets Content-Length header
- With Suspense: streams via `resolveHtmlStream()`

### Config

```typescript
interface FastifyKitaHtmlOptions {
  autoDoctype: boolean; // default: true
}
```

### Compatibility: Fastify 4.x and 5.x

## Examples

### fastify-htmx (port 32013)

- Full interactive dashboard with HTMX
- Click counter, todo list, server time polling, system metrics, notifications
- Suspense with skeleton fallbacks for async stats
- HTMX patterns: hx-post, hx-get, hx-delete, hx-target, hx-swap (innerHTML, outerHTML,
  beforeend, afterbegin, morph:innerHTML), hx-trigger, hx-indicator
- In-memory store for state
- Tailwind CSS styling

### http-server (port 32012)

- Raw Node.js HTTP server (no framework)
- renderToStream() piped directly to response
- Transfer-Encoding: chunked
- Multiple independent Suspense boundaries
- Skeleton fallback components
- randomDelay for simulated async data fetching

## Docs Site (packages/docs)

### Framework: Rspress

- Port 1229 for dev
- Plugins: Twoslash, Sitemap, File Tree, OG images
- Custom theme with KitaJS brand colors (terracotta/coral: #bd695e, #ad4336, #e4c8c5)
- Interactive hero component (VSCode mockup showing JSX → HTML)

### Current Mockup Structure (to be replaced)

```
docs/
  index.md (homepage)
  _nav.json (Guide, Integrations, API, GitHub)
  guide/
    introduction.md
    getting-started.md
    features/
      jsx-syntax.md
      async-components.md
      benchmark.md
    xss-protection/
      overview.md
      sanitization.md
      scanner.md
  integrations/
    overview.md
    frameworks/fastify.md
    libraries/htmx.md, alpine.md, turbo.md, base-templates.md
  api/
    index.md
    core.md
    jsx-runtime.md
    plugins.md
```

## Key Concepts for Documentation

### Why strings are fast

No virtual DOM overhead, no reconciliation, no diffing. Direct string concatenation. V8
optimizes string operations heavily. The benchmark shows 7-41x faster than React for
various scenarios.

### XSS story

Since `<div />` returns a string, there's no way to distinguish user-provided HTML from
component children. So children are NOT escaped by default. Three-layer protection:

1. `@kitajs/ts-html-plugin` LSP catches it in the editor while coding
2. `xss-scan` CLI catches it in CI/CD
3. `safe` attribute escapes at runtime

The key message: not being XSS-safe by default does NOT mean it's XSS-prone. The tooling
catches all cases. Users can only write XSS-vulnerable code if they deliberately suppress
warnings.

### Async JSX

Any async component makes the entire parent tree async (Promise propagation). Suspense
solves the "wait for everything" problem by streaming fallback immediately and replacing
with real content when ready. Uses request IDs (rid) for concurrent safety.
