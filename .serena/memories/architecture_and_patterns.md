# Architecture and Design Patterns

## Core Architecture

### JSX Runtime Model

The library transforms JSX into function calls that generate HTML strings:

```tsx
<div class="foo">{content}</div>;
// Transpiles to:
jsx('div', { class: 'foo', children: content });
// Returns: '<div class="foo">content</div>'
```

Key architectural points:

- JSX elements are **always strings or Promises** (never React-like objects)
- No virtual DOM - direct string generation
- Async components propagate up the tree (if child is async, parent becomes async)

### Monorepo Structure

- **Workspace-based**: Uses pnpm workspaces with shared catalog for dependencies
- **Independent versioning**: Each package has its own version via changesets
- **Shared configuration**: Root-level TypeScript and Prettier configs

## Key Design Patterns

### 1. String Building Pattern

Core pattern: Efficient string concatenation without intermediate objects

```javascript
// From index.js
function createElement(tag, attrs, ...children) {
  return `<${tag}${attributesToString(attrs)}>${contentsToString(children)}</${tag}>`;
}
```

### 2. Async/Await Pattern

Async components are seamlessly integrated:

- Sync components return `string`
- Async components return `Promise<string>`
- Type system tracks async propagation via `JSX.Element` type

### 3. Security by Default Pattern

- **Attributes**: Auto-escaped by default
- **Children**: Must explicitly use `safe` attribute or `Html.escapeHtml()`
- **TypeScript Plugin**: Catches XSS at compile time

### 4. Suspense Pattern

Streaming HTML with fallback content:

```tsx
<Suspense rid={rid} fallback={<Loading />} catch={(err) => <Error />}>
  <AsyncComponent />
</Suspense>
```

Uses request IDs (rid) for concurrent request safety.

### 5. Error Boundary Pattern

Catch errors in async component trees:

```tsx
<ErrorBoundary catch={(err) => <ErrorView />}>
  <AsyncComponent />
</ErrorBoundary>
```

## Module System

### Exports Pattern

Each package uses explicit exports in package.json:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./jsx-runtime": "./dist/jsx-runtime.js",
    "./suspense": "./dist/suspense.js"
    // etc.
  }
}
```

### CommonJS with ESM Compatibility

- Main output: CommonJS
- `esModuleInterop` enabled for compatibility
- No ESM build currently (could be added)

## Type System Patterns

### 1. Namespace-based Types

Uses `JSX` namespace for type definitions:

```typescript
declare namespace JSX {
  interface IntrinsicElements {
    div: HtmlTag & {
      /* div-specific */
    };
  }
}
```

### 2. Type Extensions

Users can extend types globally:

```typescript
declare global {
  namespace JSX {
    interface HtmlTag {
      'hx-get'?: string; // HTMX support
    }
  }
}
```

### 3. Conditional Types

`JSX.Element` is conditionally `string | Promise<string>` based on usage.

## Testing Patterns

### 1. Vitest Test Runner

Uses Vitest with coverage and type checking:

```typescript
import { describe, it, expect } from 'vitest';

describe('component', () => {
  it('renders correctly', () => {
    expect(<div>hello</div>).toBe('<div>hello</div>');
  });
});
```

### 2. JSDOM for DOM Testing

When DOM testing is needed:

```typescript
import { JSDOM } from 'jsdom';
const dom = new JSDOM(htmlString);
```

### 3. Vitest Type Testing

For TypeScript type definitions (using vitest --typecheck):

```typescript
// Uses vitest's built-in type testing capabilities
import { expectTypeOf } from 'vitest';
expectTypeOf(<div>foo</div>).toEqualTypeOf<string>();
```

## Performance Patterns

### 1. Minimal Allocations

- Avoid creating intermediate objects
- Direct string concatenation where possible
- Avoid regex when string methods suffice

### 2. Void Element Optimization

Special handling for self-closing tags:

```javascript
if (isVoidElement(tag)) {
  return `<${tag}${attributesToString(attrs)}>`;
}
```

### 3. Attribute String Building

Efficient attribute serialization with kebab-case conversion:

```javascript
function attributesToString(attrs) {
  // Optimized string building
}
```

## Guidelines and Best Practices

### Do's:

- Use `safe` attribute for all user input
- Prefer composition over prop drilling
- Keep components pure when possible
- Use TypeScript strict mode
- Write tests for new features
- Consider performance for core HTML generation

### Don'ts:

- Don't use React-specific patterns (hooks, context, etc.)
- Don't create circular dependencies between packages
- Don't bypass XSS safety features
- Don't use `any` type without strong justification
- Don't mix CommonJS and ESM syntax

### Async Component Guidelines:

- Use request IDs (rid) for Suspense components
- Error boundaries for async error handling
- Avoid AsyncLocalStorage (performance penalty)
- Document when a component is async

### Security Guidelines:

- **ALWAYS** escape user input
- Use `@kitajs/ts-html-plugin` to catch XSS issues
- Review all changes to escaping logic carefully
- Test with malicious input samples
