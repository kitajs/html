# KitaJS HTML Monorepo - Developer Guide

## Overview

KitaJS HTML is a monorepo containing a super-fast JSX runtime that generates HTML strings.
Unlike React, which builds a virtual DOM, this library directly produces HTML strings,
making it ideal for server-side rendering, static site generation, and HTMX-style
applications.

## Repository Structure

```
kitajs/html/
├── packages/
│   ├── html/               # Core JSX runtime (@kitajs/html)
│   ├── ts-html-plugin/     # XSS detection TypeScript plugin (@kitajs/ts-html-plugin)
│   └── fastify-html-plugin/# Fastify integration (@kitajs/fastify-html-plugin)
├── benchmarks/             # Performance benchmarks
└── examples/               # Usage examples
```

## Package Dependencies

```
@kitajs/html (core)
    ↑
    ├── @kitajs/ts-html-plugin (peer dependency)
    │
    └── @kitajs/fastify-html-plugin (peer dependency)
```

## Quick Start

### Development Commands

```bash
# Install dependencies (pnpm required)
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Format code
pnpm format

# Run benchmarks
pnpm bench
```

### Per-Package Commands

```bash
# Build specific package
pnpm --filter "@kitajs/html" build

# Test specific package
pnpm --filter "@kitajs/ts-html-plugin" test

# Run commands from package directory
cd packages/html && pnpm test
```

## Architecture Overview

### Core Concept: JSX → String

```tsx
// Input (JSX)
<div class="hello">{name}</div>;

// TypeScript transforms to
jsx('div', { class: 'hello', children: name });

// Output (string)
('<div class="hello">Arthur</div>');
```

### Key Architectural Decisions

1. **No Virtual DOM**: Direct string concatenation for maximum performance
2. **Type as String**: `JSX.Element = string | Promise<string>`
3. **Async Propagation**: Promise children make parent promises
4. **XSS by Default**: Children are NOT escaped unless `safe` attribute is used
5. **Compile-Time Safety**: TypeScript plugin catches XSS at development time

### Data Flow

```
User Code (TSX)
      │
      ▼
TypeScript Compiler
      │ (jsx: "react-jsx", jsxImportSource: "@kitajs/html")
      ▼
jsx-runtime.ts (jsx/jsxs functions)
      │
      ▼
index.ts (createElement, attributesToString, contentsToString)
      │
      ▼
HTML String (or Promise<string> for async)
```

### XSS Protection Flow

```
User writes JSX
      │
      ▼
ts-html-plugin (LSP) ─────► Warnings/Errors in Editor
      │
      ▼
xss-scan (CLI) ────────────► CI/CD Pipeline Check
      │
      ▼
Runtime (safe attribute) ──► Escapes at render time
```

## Package Summaries

### @kitajs/html

The core JSX runtime. Key files:

- `src/index.ts`: Escaping, attribute handling, element creation
- `src/jsx-runtime.ts`: Modern JSX transform (`jsx`, `jsxs`, `Fragment`)
- `src/suspense.ts`: Streaming HTML with async components
- `src/error-boundary.ts`: Error handling for async trees

**See:** [`packages/html/CLAUDE.md`](packages/html/CLAUDE.md)

### @kitajs/ts-html-plugin

TypeScript plugin for XSS detection. Key files:

- `src/index.ts`: Language Service Plugin entry
- `src/cli.ts`: `xss-scan` CLI tool
- `src/util.ts`: Core detection algorithms
- `src/errors.ts`: Error codes (K601-K604)

**See:** [`packages/ts-html-plugin/CLAUDE.md`](packages/ts-html-plugin/CLAUDE.md)

### @kitajs/fastify-html-plugin

Fastify integration. Key file:

- `src/index.ts`: Plugin registration, `reply.html()`, Suspense streaming

**See:**
[`packages/fastify-html-plugin/CLAUDE.md`](packages/fastify-html-plugin/CLAUDE.md)

## Tech Stack

| Tool                | Purpose                              |
| ------------------- | ------------------------------------ |
| **pnpm**            | Package manager (required)           |
| **TypeScript 5.9+** | Language                             |
| **tsgo**            | TypeScript compiler (native preview) |
| **Vitest**          | Test runner                          |
| **c8/v8**           | Code coverage                        |
| **Prettier**        | Code formatting                      |
| **Husky**           | Git hooks                            |
| **Changesets**      | Version management                   |

## Configuration

### TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@kitajs/html",
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }],
    "strict": true,
    "module": "CommonJS",
    "target": "ESNext"
  }
}
```

### VSCode Settings

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Performance Patterns

The codebase uses several optimization patterns:

1. **Check Before Convert**: Regex test before expensive operations

   ```typescript
   if (!CAMEL_REGEX.test(camel)) return camel;
   ```

2. **Loop vs Regex**: Character loops faster than regex for replacements

   ```typescript
   for (; end < length; end++) {
     switch (value[end]) { ... }
   }
   ```

3. **Escape Once**: Escape entire result string, not individual pieces

4. **Void Element Ordering**: Most common tags first in checks

5. **Bun Detection**: Use native `Bun.escapeHTML` when available

## Security Model

### XSS Prevention Layers

1. **Compile-Time**: `@kitajs/ts-html-plugin` catches unsafe usage
2. **CI/CD**: `xss-scan` CLI fails builds on XSS issues
3. **Runtime**: `safe` attribute escapes content

### Safe Content Types

- Numbers, booleans, bigints
- String literals
- `JSX.Element` (already rendered)
- `Html.Children` type
- Variables prefixed with `safe`
- `Html.escapeHtml()` calls

### Unsafe Content Types

- `string` (dynamic)
- `any` type
- Objects with `toString()`
- Variables prefixed with `unsafe`

## Common Patterns

### Component Definition

```tsx
import type { PropsWithChildren } from '@kitajs/html';

function Card({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div class="card">
      <h2 safe>{title}</h2>
      {children}
    </div>
  );
}
```

### Async Component

```tsx
async function UserProfile({ id }: { id: string }) {
  const user = await db.getUser(id);
  return <div safe>{user.name}</div>;
}
```

### Suspense Usage

```tsx
function Page({ rid }: { rid: number }) {
  return (
    <Suspense rid={rid} fallback={<Loading />} catch={(e) => <Error error={e} />}>
      <AsyncContent />
    </Suspense>
  );
}

// With Fastify
app.get('/', (req, reply) => reply.html(<Page rid={req.id} />));
```

### Conditional Classes

```tsx
<div class={['base', isActive && 'active', size]} />
```

## Testing Guidelines

1. **XSS Safety**: Always test with malicious input samples
2. **Async Handling**: Test both sync and async component paths
3. **Type Coverage**: Use `vitest --typecheck` for type tests
4. **Performance**: Run benchmarks for core changes

## Contribution Workflow

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Make changes
4. Format: `pnpm format`
5. Build: `pnpm build`
6. Test: `pnpm test`
7. Create changeset: `pnpm changeset`
8. Submit PR

## Examples

The `examples/` directory contains working examples:

- `fastify-htmx.tsx`: Fastify + HTMX integration with Suspense
- `http-server.tsx`: Plain Node.js HTTP server with streaming

Run examples:

```bash
npx tsx examples/fastify-htmx.tsx
npx tsx examples/http-server.tsx
```

## Common Gotchas

1. **Children NOT escaped by default** - Always use `safe` for user input
2. **`JSX.Element` is `string | Promise<string>`** - Handle both cases
3. **Suspense needs `rid`** - Use request ID for concurrent safety
4. **Components need `Html.escapeHtml()`** - `safe` only works on native elements
5. **pnpm required** - npm/yarn will fail on install
