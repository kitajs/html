# JSX Runtime

The JSX runtime is the core transformation layer that converts JSX syntax into HTML
strings.

## How JSX Transform Works

When you write JSX in TypeScript:

```tsx
<div class="hello">{name}</div>
```

TypeScript compiles it to:

```js
import { jsx } from '@kitajs/html/jsx-runtime';

jsx('div', { class: 'hello', children: name });
```

Which returns:

```html
<div class="hello">Arthur</div>
```

## Configuration

Enable the JSX runtime in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@kitajs/html"
  }
}
```

This tells TypeScript to:

1. Use the modern JSX transform (`react-jsx`)
2. Import jsx functions from `@kitajs/html/jsx-runtime`

## Runtime Functions

### `jsx()`

Creates a JSX element from dynamic children.

```tsx
jsx(type: string, props: object, key?: string): string | Promise<string>
```

**Examples:**

```tsx
// <div>Hello</div>
jsx('div', { children: 'Hello' });

// <input type="text" />
jsx('input', { type: 'text' });

// <div class="btn" disabled>Click</div>
jsx('div', { class: 'btn', disabled: true, children: 'Click' });
```

### `jsxs()`

Creates a JSX element from static children (compile-time optimization).

```tsx
jsxs(type: string, props: object, key?: string): string | Promise<string>
```

TypeScript uses `jsxs()` when it can statically analyze the children:

```tsx
// Uses jsxs() - children are static
<div>
  <span>Hello</span>
  <span>World</span>
</div>

// Uses jsx() - children are dynamic
<div>
  {items.map((item) => (
    <span>{item}</span>
  ))}
</div>
```

### `Fragment`

Creates a fragment that groups multiple elements without adding a wrapper.

```tsx
Fragment(props: { children?: Children }): string | Promise<string>
```

**Example:**

```tsx
<>
  <div>1</div>
  <div>2</div>
</>;

// Equivalent to:
Fragment({ children: [jsx('div', { children: '1' }), jsx('div', { children: '2' })] });

// Returns: '<div>1</div><div>2</div>'
```

## Element Creation

### Void Elements

Self-closing elements automatically close without children:

```tsx
<input type="text" />
// <input type="text">

<br />
// <br>

<img src="/logo.png" alt="Logo" />
// <img src="/logo.png" alt="Logo">
```

### Boolean Attributes

Boolean attributes render as HTML boolean attributes:

```tsx
<button disabled>Click</button>
// <button disabled>Click</button>

<input checked={false} />
// <input>

<select multiple={true}>...</select>
// <select multiple>...</select>
```

### Class Arrays

The `class` attribute supports conditional arrays:

```tsx
<div class={['btn', isActive && 'active', size]} />
// <div class="btn active large"></div>
```

## Async Handling

When children contain promises, the entire element becomes async:

```tsx
async function AsyncChild() {
  await delay(100);
  return <span>Loaded</span>;
}

const element = (
  <div>
    <AsyncChild />
  </div>
);

// element is Promise<string>
console.log(element instanceof Promise); // true
console.log(await element); // '<div><span>Loaded</span></div>'
```

## Performance Optimizations

The runtime uses several optimizations:

1. **String concatenation** - Direct string building, no intermediate objects
2. **jsxs vs jsx** - Static children use optimized path
3. **Void element detection** - Skip closing tags for self-closing elements
4. **Attribute caching** - Common patterns optimized
5. **Escape-once** - Escape entire string at end, not each piece

## Internals

### How Attributes Are Processed

```tsx
// Input
<div class="btn" data-id={userId} disabled />

// Calls
jsx('div', {
  class: 'btn',
  'data-id': userId,
  disabled: true
});

// Processing
attributesToString({
  class: 'btn',      → ' class="btn"'
  'data-id': 123,    → ' data-id="123"'
  disabled: true     → ' disabled'
});

// Output
'<div class="btn" data-id="123" disabled></div>'
```

### How Children Are Processed

```tsx
// Array children are flattened and concatenated
contentsToString([
  'Hello',           → 'Hello'
  <span>World</span> → '<span>World</span>'
]);
// 'Hello<span>World</span>'
```

## Legacy JSX Transform

If using the legacy JSX transform:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "Html.createElement",
    "jsxFragmentFactory": "Html.Fragment"
  }
}
```

```tsx
import Html from '@kitajs/html';

// Compiles to: Html.createElement('div', null, 'Hello')
<div>Hello</div>;
```

:::tip Recommendation Use the modern JSX transform (`react-jsx`) for better performance
and smaller bundle sizes. :::

## Next Steps

- [Core API](/api/core) - Core functions reference
- [TypeScript Plugin](/api/plugins) - XSS detection plugin
- [JSX Syntax](/guide/features/jsx-syntax) - JSX usage guide
