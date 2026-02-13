---
overview: true
title: API Reference
---

# API Reference

Complete API documentation for @kitajs/html and its related packages.

## Core Packages

### [@kitajs/html](/api/core)

The main JSX runtime that generates HTML strings.

**Key exports:**
- `jsx`, `jsxs`, `Fragment` - JSX transform functions
- `escapeHtml`, `e`, `escape` - Escaping utilities
- `contentsToString`, `attributesToString` - Internal utilities

### [@kitajs/html/jsx-runtime](/api/jsx-runtime)

The JSX runtime module for the modern JSX transform.

**Exports:**
- `jsx(type, props, key)` - Create JSX elements
- `jsxs(type, props, key)` - Create JSX elements with static children
- `Fragment` - JSX fragment component

### [@kitajs/ts-html-plugin](/api/plugins)

TypeScript Language Service Plugin for XSS detection.

**Features:**
- Real-time XSS vulnerability detection
- CLI tool (`xss-scan`) for CI/CD
- Error codes K601-K604

## Usage

```tsx
import Html from '@kitajs/html';
import { escapeHtml } from '@kitajs/html';
import { Suspense } from '@kitajs/html/suspense';
import { ErrorBoundary } from '@kitajs/html/error-boundary';
```

## Type Definitions

All JSX type definitions are available globally once configured in tsconfig.json.

```tsx
// Global types
declare namespace JSX {
  interface Element extends String {}
  interface IntrinsicElements {
    div: HtmlTag;
    // ... all HTML elements
  }
}
```

## Next Steps

- [Core API](/api/core) - Main functions and utilities
- [JSX Runtime](/api/jsx-runtime) - JSX transform details
- [TypeScript Plugin](/api/plugins) - XSS detection plugin
