---
name: kita-project-knowledge
description:
  Documentation index for Kita Html. Maps concepts to official documentation files for
  runtime behavior, XSS detection, Suspense, and integrations.
user-invocable: false
---

# Kita Html - Project Knowledge Index

You are working with Kita Html, a JSX runtime that produces HTML strings instead of a
virtual DOM.

## Quick Reference

- **What it is**: JSX DX with string output performance (no virtual DOM, no reactivity)
- **Key type**: `JSX.Element = string | Promise<string>`
- **XSS model**: Children not escaped by default, caught by TypeScript tooling (3-layer
  protection)
- **Use cases**: Server-side rendering, static site generation, HTMX-style applications

## Documentation Map

When you need information about specific topics, read these documentation files:

### Core Runtime Behavior

- **JSX compilation process**: `packages/docs/docs/guide/how-jsx-becomes-html.md`
  - How TypeScript transforms JSX to function calls
  - Runtime string concatenation
  - Async propagation rules

- **Design rationale**: `packages/docs/docs/guide/design-decisions.md`
  - Why no context API
  - Why JSX.Element includes Promise
  - Performance trade-offs

- **Introduction & overview**: `packages/docs/docs/guide/introduction.mdx`
  - Core value proposition
  - What makes Kita Html different

- **JSX syntax**: `packages/docs/docs/guide/jsx/syntax.md`
  - Conditional rendering
  - Arrays and lists
  - Attributes and props
  - Fragments

- **Type extensions**: `packages/docs/docs/guide/jsx/extending-types.md`
  - Adding custom attributes
  - Extending global types
  - HTMX, Alpine.js, Hotwire Turbo types

### XSS Detection & Safety

- **Safety rules** (what's safe/unsafe): `packages/docs/docs/guide/xss/safety-rules.md`
  - Safe types (numbers, booleans, JSX.Element, etc.)
  - Unsafe types (string, any, objects)
  - Composite types (unions, ternaries)
  - Exceptions (script tags)

- **Error codes** (TS88601-TS88604): `packages/docs/docs/guide/xss/error-codes.mdx`
  - TS88601: Content may introduce XSS vulnerability
  - TS88602: Double escaping with safe attribute
  - TS88603: Component children need escapeHtml()
  - TS88604: Unnecessary safe attribute
  - Full examples and fixes for each

- **Safe attribute usage**: `packages/docs/docs/guide/xss/safe-attribute.md`
  - How the safe attribute works
  - When to use it
  - Fragment with safe pattern

- **Detection algorithm**: `packages/docs/docs/api/xss-analysis.md`
  - Analysis functions (recursiveDiagnoseJsxElements, isSafeAttribute)
  - Component vs element detection
  - AST traversal logic

- **Why not auto-escape**: `packages/docs/docs/guide/xss/why-not-auto-escape.md`
  - Performance rationale
  - Three-layer protection model

- **Detection in editor**: `packages/docs/docs/api/editor-plugin.md`
  - Language Service Plugin setup
  - Real-time diagnostics

- **Scanner CLI**: `packages/docs/docs/api/scanner-cli.md`
  - xss-scan command usage
  - CI/CD integration

### Async & Suspense

- **Suspense overview**: `packages/docs/docs/guide/async/suspense.md`
  - How Suspense streaming works
  - Request isolation (rid)
  - When to use Suspense

- **Using Suspense**: `packages/docs/docs/guide/async/using-suspense.md`
  - Basic usage patterns
  - Fallback components
  - Error handling

- **Streaming internals**: `packages/docs/docs/guide/async/streaming-internals.md`
  - How the streaming system works
  - `SuspenseRoot` store state
  - Client-side replacement script

- **Error boundaries**: `packages/docs/docs/guide/async/error-boundaries.md`
  - Catching errors in async trees
  - HtmlTimeout error class
  - Timeout handling

- **Async components**: `packages/docs/docs/guide/async/async-components.md`
  - Writing async components
  - Promise propagation
  - Return types

### Framework Integrations

- **Fastify plugin**: `packages/docs/docs/integrations/frameworks/fastify.mdx`
  - reply.html() API
  - Auto-doctype behavior
  - Suspense integration

- **Elysia**: `packages/docs/docs/integrations/frameworks/elysia.mdx`
  - Elysia integration patterns

- **Integration overview**: `packages/docs/docs/integrations/overview.md`
  - Available integrations
  - When to use each

- **Base templates**: `packages/docs/docs/integrations/base-templates.md`
  - Shared layout patterns

### Type Extensions

- **HTMX attributes**: `packages/docs/docs/integrations/type-extensions/htmx.md`
  - hx-get, hx-post, hx-swap, etc.

- **Alpine.js directives**: `packages/docs/docs/integrations/type-extensions/alpine.md`
  - x-data, x-bind, x-on, etc.

- **Hotwire Turbo**: `packages/docs/docs/integrations/type-extensions/hotwire-turbo.md`
  - Turbo Frame, Turbo Stream elements

### Reference Documentation

- **Benchmarks**: `packages/docs/docs/guide/reference/benchmarks.md`
  - Performance comparisons
  - Why strings are fast

- **Compatibility**: `packages/docs/docs/guide/reference/compatibility.md`
  - Node.js versions
  - TypeScript versions
  - Runtime compatibility (Node, Bun, Deno)

- **Migration guide**: `packages/docs/docs/guide/reference/migrating-from-html.md`
  - Upgrading from older versions
  - Breaking changes

- **Additional configuration**: `packages/docs/docs/guide/reference/additional-config.md`
  - tsconfig.json setup
  - Editor configuration

## Implementation Details (CLAUDE.md files)

For deep implementation details beyond user-facing documentation:

- **Core runtime internals**: `packages/html/CLAUDE.md`
  - Key files and functions
  - Escaping algorithms
  - Performance optimization patterns
  - Void element detection

- **XSS plugin internals**: `packages/ts-html-plugin/CLAUDE.md`
  - Plugin architecture
  - Detection algorithm implementation
  - AST traversal patterns
  - Test debugging (TSLangServer)

- **Fastify plugin internals**: `packages/fastify-html-plugin/CLAUDE.md`
  - Plugin registration
  - reply.html() implementation
  - Suspense stream detection

- **Documentation site internals**: `packages/docs/CLAUDE.md`
  - Rspress configuration
  - Information Mapping methodology
  - Writing style guidelines
  - TypeDoc auto-generation

## Critical Gotchas (Quick Reference)

1. **Children NOT escaped by default** - Intentional for performance; XSS plugin catches
   unsafe usage
2. **`JSX.Element` is `string | Promise<string>`** - Components must handle both sync and
   async cases
3. **Suspense needs `rid`** - Use request ID (e.g., `req.id` in Fastify) for concurrent
   safety
4. **Async propagation is automatic** - One async child makes entire parent tree async
5. **Script tags exempt** - `<script>` content not checked (intentionally executable)
6. **Component vs element** - Uppercase = component (use Fragment + safe or escapeHtml),
   lowercase = element (use safe attribute)
7. **`safe` + JSX children = TS88602** - Causes double escaping error; use Fragment
   instead

## When Working On

**Adding features**: Update docs in `packages/docs/docs/` in the same commit

**Fixing bugs**: Read relevant doc file first to understand intended behavior

**Understanding XSS errors**: Read `packages/docs/docs/guide/xss/error-codes.mdx` for full
context and fixes

**Performance work**: Read `packages/docs/docs/guide/design-decisions.md` and
`packages/html/CLAUDE.md`

**Documentation changes**: Follow `packages/docs/CLAUDE.md` for writing conventions

**Development workflow**: Follow `.claude/skills/kita-dev-workflow/SKILL.md` for testing,
formatting, changesets

## Monorepo Structure

```
packages/
  html/                  @kitajs/html - Core JSX runtime
  ts-html-plugin/        @kitajs/ts-html-plugin - XSS detection
  fastify-html-plugin/   @kitajs/fastify-html-plugin - Fastify integration
  docs/                  @kitajs/docs-html - Documentation site (Rspress)
benchmarks/              Performance benchmarks
examples/
  fastify-htmx/          Fastify + HTMX demo (port 32013)
  http-server/           Node.js HTTP + Suspense (port 32012)
```
