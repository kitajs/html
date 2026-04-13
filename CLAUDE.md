# Kita Html Monorepo - Developer Guide

## Overview

Kita Html is a monorepo containing a super-fast JSX runtime that generates HTML strings.
Unlike React, which builds a virtual DOM, this library directly produces HTML strings,
making it ideal for server-side rendering, static site generation, and HTMX-style
applications.

## Repository Structure

```
kitajs/html/
├── packages/
│   ├── html/               # Core JSX runtime (@kitajs/html)
│   ├── ts-html-plugin/     # XSS detection TypeScript plugin (@kitajs/ts-html-plugin)
│   ├── fastify-html-plugin/# Fastify integration (@kitajs/fastify-html-plugin)
│   ├── express-html-plugin/# Express integration (@kitajs/express-html-plugin)
│   └── docs/               # Documentation site (@kitajs/docs-html)
├── benchmarks/             # Performance benchmarks
└── examples/               # Usage examples
```

## Package Dependencies

```
@kitajs/html (core)
    ↑
    ├── @kitajs/ts-html-plugin (peer dependency)
    │
    ├── @kitajs/fastify-html-plugin (peer dependency)
    │
    └── @kitajs/express-html-plugin (peer dependency)
```

The adapter packages add framework-specific HTML response glue on top of the core runtime.
The docs site also generates API reference pages for the core runtime and current adapter
packages.

## Quick Start

```bash
pnpm install        # Install dependencies (pnpm >=10 required)
pnpm build          # Build published packages under packages/*
pnpm build-all      # Build the full workspace
pnpm test           # Run all tests
pnpm test-types     # Type-check all packages
pnpm format         # Format code
pnpm bench          # Run benchmarks
```

Use Node.js 24 or later. The root `package.json` enforces `node >=24` and `pnpm >=10`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full development workflow, per-package
commands, and pull request guidelines.

## Architecture Overview

### Core Concept: JSX → String

```tsx
// Input (JSX)
;<div class="hello">{name}</div>

// TypeScript transforms to
jsx('div', { class: 'hello', children: name })

// Output (string)
;('<div class="hello">Arthur</div>')
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
- `src/errors.ts`: Error codes (TS88601-TS88604)

**See:** [`packages/ts-html-plugin/CLAUDE.md`](packages/ts-html-plugin/CLAUDE.md)

### Framework Adapters

Framework adapters follow the same general shape: a thin integration layer that wires the
framework request/response objects to the core runtime, handles HTML response headers, and
supports Suspense streaming.

- `packages/fastify-html-plugin/`
- `packages/express-html-plugin/`

Package-specific details live in each package's own `CLAUDE.md`.

### @kitajs/docs-html

Documentation site at https://html.kitajs.org. Uses Rspress, follows Information Mapping
methodology.

**See:** [`packages/docs/CLAUDE.md`](packages/docs/CLAUDE.md)

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
   if (!CAMEL_REGEX.test(camel)) return camel
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

## Documentation Rule

Any change to the runtime, types, API surface, configuration, or behavior of any package
must include a corresponding update to the documentation at `packages/docs/`. If a code
change would make any existing documentation page inaccurate, update that page in the same
commit. Follow `packages/docs/CLAUDE.md` for docs structure and writing conventions. Run
`pnpm -F @kitajs/docs-html build` to verify the docs site compiles after any documentation
change.

## Common Patterns

### Component Definition

```tsx
import type { PropsWithChildren } from '@kitajs/html'

function Card({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div class="card">
      <h2 safe>{title}</h2>
      {children}
    </div>
  )
}
```

### Async Component

```tsx
async function UserProfile({ id }: { id: string }) {
  const user = await db.getUser(id)
  return <div safe>{user.name}</div>
}
```

### Suspense Usage

```tsx
function Page({ rid }: { rid: number }) {
  return (
    <Suspense rid={rid} fallback={<Loading />} catch={(e) => <Error error={e} />}>
      <AsyncContent />
    </Suspense>
  )
}

// With Fastify
app.get('/', (req, reply) => reply.html(<Page rid={req.id} />))

// With Express
app.get('/', (req, res) => res.html(<Page rid={req.id} />))
```

### Conditional Classes

```tsx
<div class={['base', isActive && 'active', size]} />
```

## Common Gotchas

1. **Children NOT escaped by default** - Always use `safe` for user input
2. **`JSX.Element` is `string | Promise<string>`** - Handle both cases
3. **Suspense needs `rid`** - Use request ID for concurrent safety
4. **Components receive `safe` as a prop** - They must forward it to inner native elements
5. **pnpm required** - npm/yarn will fail on install
