# H3 and Nitro HTML Plugins

## Goal

Add two published packages:

| Package                     | Responsibility                                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `@kitajs/h3-html-plugin`    | H3 v2 request integration, `event.html(...)`, request IDs, doctype handling, Suspense streaming, and factory-safe Kita handlers         |
| `@kitajs/nitro-html-plugin` | Nitro v3 module that scans `server/pages`, generates lazy H3 route wrappers, and configures one root catch-all page as Nitro's renderer |

> [!IMPORTANT] Kita Suspense currently uses `node:async_hooks` and `node:stream`. The
> first release will support Node-compatible H3 and Nitro runtimes only and will not claim
> edge-runtime compatibility.

## Confirmed Design

- Use separate packages, not an `@kitajs/h3-html-plugin/nitro` subpath.
- Target H3 v2 and Nitro v3 only.
- Expose both `h3KitaHtml()` with `event.html(...)` and `defineKitaHandler(render)`.
- Page files default-export `(event: H3Event) => JSX.Element`.
- Convention pages always use `renderToStream(factory)` so async roots can create their
  first Suspense boundary after yielding without losing state.
- Scan `.tsx` and `.jsx` pages only.
- Support route groups and named catch-alls.
- Fail on generated-page, explicit-route, and renderer conflicts.
- A root catch-all renders GET and HEAD with status 200 unless the page changes it; other
  methods receive 405.

## Public APIs

### H3

```tsx
import { H3 } from 'h3'
import { defineKitaHandler, h3KitaHtml } from '@kitajs/h3-html-plugin'

const app = new H3()
app.register(h3KitaHtml({ autoSuspense: true }))

app.get('/fragment', (event) => event.html(<div>Fragment</div>))
app.get(
  '/page',
  defineKitaHandler((event) => (
    <html>
      <body>Page</body>
    </html>
  ))
)
```

Planned surface:

```ts
interface H3KitaHtmlOptions {
  autoDoctype?: boolean
  autoSuspense?: boolean
  genRequestId?: (event: H3Event) => string | number
}

function h3KitaHtml(options?: H3KitaHtmlOptions): H3Plugin

function defineKitaHandler(
  render: (event: H3Event) => JSX.Element,
  options?: Pick<H3KitaHtmlOptions, 'autoDoctype' | 'genRequestId'>
): EventHandlerWithFetch
```

`event.html(...)` mirrors `res.html(...)` and `reply.html(...)`: it preserves buffered
sync/async responses when no Suspense state exists and streams only active Suspense
output. `defineKitaHandler(...)` owns JSX evaluation and uses the factory form of
`renderToStream`, making delayed-root `AutoSuspense` reliable; this path always returns a
stream.

The plugin augments `H3Event` with `html(...)` and stores its generated request ID in
`event.context.kitaHtml.requestId`. Existing context state is reused. IDs are compact
trusted tokens generated once per request; arbitrary request headers are not used
directly.

### Nitro

```ts
import { defineConfig } from 'nitro'
import { nitroKitaHtml } from '@kitajs/nitro-html-plugin'

export default defineConfig({
  serverDir: './server',
  modules: [nitroKitaHtml()]
})
```

```text
server/pages/
  index.tsx               -> GET /
  about.tsx               -> GET /about
  blog/[slug].tsx         -> GET /blog/:slug
  (admin)/users.tsx       -> GET /users
  files/[...path].tsx     -> GET /files/**:path
  [...].tsx               -> GET/HEAD fallback renderer
```

Planned module options:

```ts
interface NitroKitaHtmlOptions {
  pagesDir?: string
  autoDoctype?: boolean
  ignore?: string[]
}

function nitroKitaHtml(options?: NitroKitaHtmlOptions): NitroModule
```

`pagesDir` defaults to `<serverDir>/pages`; when Nitro scanning is disabled, it falls back
to `<rootDir>/server/pages`. A missing default directory is a no-op with a warning, while
a missing explicitly configured directory is an error.

## Implementation Steps

### 1. Add `@kitajs/h3-html-plugin`

Create `packages/h3-html-plugin/` following `packages/express-html-plugin/` and
`packages/fastify-html-plugin/`:

- `src/index.ts` exports the public plugin, handler, options, context type, and doctype
  symbol.
- `src/plugin.ts` defines `h3KitaHtml()`, initializes request-local state, decorates
  events, and wraps downstream execution with `runWithAutoSuspense` when enabled.
- `src/html.ts` implements `event.html(...)` with separate sync/async paths, captures
  `RequestData` before awaiting, applies doctype after root resolution, and uses
  `resolveHtmlStream` for active Suspense.
- `src/handler.ts` implements `defineKitaHandler(...)` with `renderToStream(factory, rid)`
  and `runWithAutoSuspense` around the render callback.
- `src/context.ts` owns namespaced context initialization and the compact base-36 default
  request-ID generator.
- `src/utils.ts` contains root `<html>` detection and the per-event doctype symbol.

Lifecycle requirements derived from `packages/html/src/suspense.ts:49-74`,
`packages/html/src/suspense.ts:448-543`, and `packages/html/src/suspense.ts:573-625`:

- Capture and retain the exact `RequestData` instance for response ownership.
- Preserve root-before-replacement ordering for unresolved roots.
- Register H3 disposal/cancellation handling and call
  `abortSuspenseRequest(rid, requestData)` only for abnormal completion.
- Never delete state by request ID without the identity-safe `RequestData` argument.
- Let H3 own transport framing; set HTML content type and buffered byte length, but do not
  manually encode chunks.
- Propagate pre-response errors through H3 normally; terminate already-committed streams
  on unrecovered asynchronous boundary errors.

`event.html(...)` will document its evaluation limitation: JSX arguments already exist
before the method runs. `defineKitaHandler(...)` is the preferred API for async roots that
may create their first Suspense boundary after an `await`.

### 2. Test the H3 adapter

Add tests for:

- Sync and async HTML, UTF-8 `Content-Length`, content type, staged status/headers,
  invalid runtime values, and promise rejection.
- Automatic doctype, global disable, fragment behavior, and per-event disable.
- Default/custom request IDs, one ID per request, and namespaced context typing.
- Explicit Suspense and `AutoSuspense`, including `AutoSuspense` after a route-level
  `await`.
- Slower async root with a faster replacement, sibling and nested out-of-order boundaries,
  monotonic boundary IDs, and concurrent request isolation.
- Browser replacement through JSDOM.
- Recovered and unrecovered boundary errors.
- Real client cancellation, state cleanup, and protection against late settlement or
  reused-ID corruption.
- Type tests for options, `H3Event.html`, context, sync/async JSX, and invalid responses.

Use a real H3 Node server for transport cancellation and wire-level streaming assertions;
use handler `.fetch()` for isolated response tests where middleware behavior remains
equivalent.

### 3. Add the Nitro page scanner

Create `packages/nitro-html-plugin/` as an ESM Nitro v3 module:

- `src/index.ts` exports `nitroKitaHtml`, `NitroKitaHtmlOptions`, and `NitroHtmlPage`.
- `src/module.ts` resolves options, invokes scanning, installs virtual modules, registers
  routes, sets the renderer, and integrates dev watching.
- `src/scan.ts` discovers supported pages deterministically and applies ignore
  conventions.
- `src/routes.ts` converts filenames to Nitro route patterns and computes canonical
  collision keys.
- `src/runtime.ts` validates page default exports and wraps them with `defineKitaHandler`
  from `@kitajs/h3-html-plugin`.
- `src/types.ts` contains shared page and scanner types.

Scanner rules:

- Support only `.tsx` and `.jsx`.
- Ignore declaration, test, spec, and underscore-prefixed file/directory segments; apply
  user `ignore` patterns afterward.
- Strip `index` only as the final complete segment.
- Remove `(group)` segments from URLs.
- Convert `[name]` to `:name`, nested `[...name]` to `**:name`, and sanitize parameter
  names consistently with Nitro.
- Treat root `[...].tsx` and root `[...name].tsx` as renderer candidates; nested
  catch-alls remain ordinary routes.
- Sort normalized relative paths before registration for deterministic builds.
- Reject invalid parameters and more than one root renderer candidate with source paths in
  the error.

### 4. Generate lazy Nitro handlers

For each ordinary page, add a unique builder-independent entry to `nitro.options.virtual`
that imports the page and passes it to the Nitro runtime wrapper. Register it in
`nitro.options.routes` as a lazy GET handler.

For the root catch-all:

- Generate the same lazy wrapper but assign it to `nitro.options.renderer.handler` rather
  than registering another `/**` route.
- Permit GET and HEAD, preserving status 200 unless the page sets another status.
- Return 405 with `Allow: GET, HEAD` for other methods.
- Do not expose a named renderer catch-all as a stable route parameter; pages use
  `event.url.pathname` for the unmatched path.
- Leave Nitro's normal 404 behavior intact when no root catch-all exists.

Each generated wrapper uses `defineKitaHandler(page, { autoDoctype })`. This delegates
request IDs, automatic Suspense scope, cancellation, and response construction to the H3
package.

Add `pagesDir` to Nitro's dev watch paths so adding/removing page files triggers a Nitro
reload; edits to existing pages continue through normal lazy module rebuilds.

### 5. Detect route and renderer conflicts

Fail with actionable diagnostics:

- Canonicalize parameter names so `/users/:id` conflicts with `/users/:slug`, and named
  catch-alls conflict regardless of parameter name.
- Detect collisions caused by `index` pages and route groups.
- Compare generated GET routes with configured `nitro.options.routes`, non-middleware
  handlers, and Nitro-scanned routes after scanning completes.
- Allow coexistence with handlers constrained to non-GET methods.
- Reject a root catch-all when `renderer.handler` or `renderer.template` is already
  configured.
- Never register the renderer candidate as both a route and renderer.
- Do not treat route rules as conflicts.

Errors include the canonical route and both conflicting source/config entries.

### 6. Test Nitro module behavior

Add coverage for:

- Filename conversion for indexes, static paths, parameters, named/unnamed catch-alls,
  route groups, Windows separators, sanitization, private files, and deterministic
  ordering.
- Page-page, page-explicit-route, page-scanned-route, grouped-route, and existing-renderer
  conflicts.
- Default/explicit/missing page directory behavior and ignore patterns.
- One lazy virtual handler per ordinary page and one lazy renderer wrapper.
- Runtime access to URL, headers, query data, route params, context, staged status, and
  staged headers.
- Sync pages, async pages, doctype options, explicit Suspense, delayed-root
  `AutoSuspense`, concurrency, cancellation, and stream errors.
- API and explicit Nitro routes taking priority over the renderer.
- GET/HEAD fallback behavior, default 200 status, and 405 behavior for other methods.
- Route rules and prerendered pages operating through generated routes.
- A build fixture proving pages are lazy and do not eagerly evaluate unrelated modules
  when `inlineDynamicImports` is false.
- Type tests for module options and the `(event: H3Event) => JSX.Element` page contract.

Use Nitro's programmatic build/fetch APIs and fixtures under
`packages/nitro-html-plugin/test/fixtures/`; create collision-only fixture trees in a test
temporary directory where practical.

### 7. Package, documentation, and release integration

- Add H3, Nitro v3, and a small scanner dependency if needed to `pnpm-workspace.yaml`;
  regenerate `pnpm-lock.yaml`.
- Configure both packages with ESM output, explicit exports, current build/test scripts,
  `@kitajs/html` peers, optional `@kitajs/ts-html-plugin`, and appropriate H3/Nitro peers.
- Add READMEs and licenses consistent with existing adapters.
- Add H3 and Nitro guides under `packages/docs/docs/integrations/frameworks/` and update
  navigation.
- Add separate TypeDoc registrations and source paths in `packages/docs/rspress.config.ts`
  and `packages/docs/tsconfig.typedoc.json`; update API navigation, ignores, package
  redirects, and docs dependencies.
- Document `server/pages`, route groups, catch-all behavior, conflicts, Node-compatible
  runtime scope, Suspense error boundaries, and the difference between `event.html(...)`
  and `defineKitaHandler(...)`.
- Update explicit package lists in repository guidance only where they would otherwise
  become stale.
- Create changesets for both new packages and any user-facing `@kitajs/html` change if
  implementation reveals one is required.

## Verification

Run affected checks after implementation and after review fixes:

```bash
pnpm install
pnpm format
pnpm -F @kitajs/h3-html-plugin build
pnpm -F @kitajs/h3-html-plugin test-types
pnpm -F @kitajs/h3-html-plugin test
pnpm -F @kitajs/nitro-html-plugin build
pnpm -F @kitajs/nitro-html-plugin test-types
pnpm -F @kitajs/nitro-html-plugin test
pnpm -F @kitajs/docs-html build
pnpm build
pnpm test-types
pnpm test
```

Run `pnpm xss-scan` if the repository exposes it after dependencies are installed;
otherwise report it as unavailable.

Perform exactly one final review pass with two parallel reviewers:

- Reviewer 1: Suspense lifecycle, request-state identity, cancellation, errors, and H3
  response semantics.
- Reviewer 2: Nitro route generation, conflicts, virtual-module laziness, package exports,
  docs, and release completeness.

Apply only concrete, local, in-scope fixes, rerun affected checks, and report any
remaining Nitro v3 beta API risk.
