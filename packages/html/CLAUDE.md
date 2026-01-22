# @kitajs/html - Developer Guide

## Overview

`@kitajs/html` is the core JSX runtime that generates HTML strings. Unlike React, which
builds a virtual DOM, this library directly produces HTML strings, making it ideal for
server-side rendering (SSR), static site generation, and any context where you need HTML
output.

## Architecture

### Core Philosophy

- **No Virtual DOM**: JSX compiles directly to string concatenation
- **Type Safety**: Full TypeScript support with strict type definitions
- **XSS Prevention**: Built-in escaping with the `safe` attribute
- **Async Support**: Seamless handling of async components with Suspense
- **Zero Dependencies**: Only `csstype` for CSS type definitions

### File Structure

```
src/
├── index.ts          # Core runtime: escaping, attributes, element creation
├── jsx-runtime.ts    # Modern JSX transform runtime (jsx, jsxs, Fragment)
├── jsx-dev-runtime.ts # Development JSX transform (adds jsxDEV)
├── jsx.ts            # Global JSX namespace type definitions
├── suspense.ts       # Streaming HTML with Suspense component
└── error-boundary.ts # Error handling for async components
```

### Key Components

#### `index.ts` - Core Runtime

The main file exports all core functionality:

- **`escapeHtml(value)`**: Escapes HTML entities (`<`, `>`, `"`, `'`, `&`). Uses Bun's
  native `escapeHTML` when available.
- **`toKebabCase(camel)`**: Converts camelCase to kebab-case for CSS properties.
- **`styleToString(style)`**: Converts style objects to CSS strings.
- **`attributesToString(attributes)`**: Serializes props to HTML attributes.
- **`contentsToString(contents, escape?)`**: Joins children into a string, handles async.
- **`contentToString(content, escape?)`**: Converts a single child to string.
- **`createElement(name, attributes, ...children)`**: Main element factory (legacy API).
- **`Fragment(props)`**: Fragment component for multiple children.

#### `jsx-runtime.ts` - Modern JSX Transform

Implements the modern `react-jsx` transform:

- **`jsx(name, attributes)`**: For elements with a single child
- **`jsxs(name, attributes)`**: For elements with multiple children (static)
- **`Fragment`**: Re-exported from index

The key difference from `createElement` is that children are passed in
`attributes.children` rather than as rest parameters.

#### `suspense.ts` - Streaming HTML

Provides streaming capabilities for async components:

- **`Suspense`**: Component that shows fallback while children resolve
- **`renderToStream(html, rid?)`**: Converts component tree to a Readable stream
- **`resolveHtmlStream(template, requestData)`**: Internal helper for stream resolution
- **`SuspenseScript`**: Client-side script for DOM updates when async content arrives

**How Suspense Works:**

1. When a Suspense component is rendered, it returns the fallback wrapped in a
   `<div data-sf>`
2. The async children are processed in the background
3. When resolved, a `<template data-sr>` and `<script data-ss>` are streamed
4. The client-side script (`$KITA_RC`) replaces the fallback with the real content

#### `error-boundary.ts` - Error Handling

- **`ErrorBoundary`**: Catches errors in async component trees
- **`HtmlTimeout`**: Error class for timeout-related failures

### JSX Type System (`jsx.ts`)

Defines the global `JSX` namespace with:

- **`JSX.Element`**: `string | Promise<string>` - elements are always strings
- **`JSX.IntrinsicElements`**: Type definitions for all HTML elements
- **`JSX.HtmlTag`**: Base interface with common HTML attributes
- **Custom attributes**: `safe`, `attrs`, conditional `class` arrays

## Key Patterns

### String Building Optimization

The library uses several optimizations for fast string generation:

```typescript
// Regex check before conversion (avoid unnecessary work)
if (!CAMEL_REGEX.test(camel)) {
  return camel;
}

// Character-by-character escaping (faster than regex replace)
for (; end < length; end++) {
  switch (value[end]) {
    case '&':
      escaped += value.slice(start, end) + '&amp;';
      start = end + 1;
      continue;
    // ...
  }
}
```

### Async Propagation

When any child is a Promise, the entire parent tree becomes async:

```typescript
if (typeof content.then === 'function') {
  return Promise.all(contents.slice(index)).then(function resolveContents(resolved) {
    resolved.unshift(result);
    return contentsToString(resolved, escape);
  });
}
```

### Void Elements

Self-closing tags are handled specially:

```typescript
export function isVoidElement(tag: string): boolean {
  return (
    tag === 'meta' ||
    tag === 'link' ||
    tag === 'img' ||
    // ... ordered by frequency
  );
}
```

### The `safe` Attribute

The `safe` attribute triggers HTML escaping for children:

```tsx
<div safe>{userInput}</div>  // Escaped
<div>{userInput}</div>       // NOT escaped - potential XSS!
```

### Conditional Classes

Arrays in the `class` attribute are joined with filtering:

```tsx
<div class={['a', condition && 'b', 'c']} />
// Renders: <div class="a c"></div> if condition is false
```

## Development

### Building

```bash
pnpm build  # Compiles TypeScript with tsgo
```

### Testing

```bash
pnpm test  # Runs vitest with coverage and type checking
```

### Type Checking

The package uses strict TypeScript configuration. Key settings:

- `strict: true`
- `noImplicitAny: true`
- `noUncheckedIndexedAccess: true`

## Integration Points

### TypeScript Configuration

Users configure their `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@kitajs/html"
  }
}
```

### Type Extensions

HTMX, Alpine.js, and Hotwire Turbo types are provided as separate `.d.ts` files:

```typescript
/// <reference types="@kitajs/html/htmx" />
```

## Performance Considerations

1. **Escape once at the end**: `contentsToString` escapes the entire result string rather
   than each piece
2. **Check before convert**: Regex tests before expensive conversions
3. **Loop vs regex**: Character loops are faster than regex for simple replacements
4. **Bun detection**: Uses Bun's native `escapeHTML` when available
5. **Void element check order**: Most common elements first

## Common Gotchas

1. **Children are NOT escaped by default** - Always use `safe` for user input
2. **`JSX.Element` is `string | Promise<string>`** - Handle both cases or await
3. **No context API** - Use props or composition instead
4. **Suspense requires `rid`** - Request IDs are mandatory for concurrent safety
