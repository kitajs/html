# Core API

The `@kitajs/html` package exports core functions for generating and manipulating HTML
strings.

## Main Functions

### `escapeHtml()`

Escapes HTML special characters to prevent XSS attacks.

```tsx
import { escapeHtml } from '@kitajs/html';

const userInput = '<script>alert("XSS")</script>';
const safe = escapeHtml(userInput);
// '&lt;script&gt;alert("XSS")&lt;/script&gt;'
```

**Signature:**

```ts
function escapeHtml(value: unknown): string;
```

**Escapes:**

- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`
- `"` → `&quot;`
- `'` → `&#39;`

### `escape()` / `e()`

Template literal version of `escapeHtml`.

```tsx
import { e } from '@kitajs/html';

const username = userInput;
const html = e`<div>Hello ${username}</div>`;
// Automatically escapes interpolated values
```

**Signature:**

```ts
function escape(strings: TemplateStringsArray, ...values: unknown[]): string;
const e: typeof escape; // Alias
```

### `contentsToString()`

Converts JSX children to an HTML string.

```tsx
import { contentsToString } from '@kitajs/html';

const children = [<div>1</div>, <div>2</div>];
const html = contentsToString(children);
// '<div>1</div><div>2</div>'
```

**Signature:**

```ts
function contentsToString(contents: Children, escape?: boolean): string | Promise<string>;
```

**Parameters:**

- `contents`: The children to convert (can be any valid JSX child)
- `escape`: Whether to escape the content (default: `false`)

### `attributesToString()`

Converts JSX props/attributes to an HTML attribute string.

```tsx
import { attributesToString } from '@kitajs/html';

const attrs = { class: 'btn', disabled: true };
const html = attributesToString(attrs);
// ' class="btn" disabled'
```

**Signature:**

```ts
function attributesToString(attributes: Record<string, any>): string;
```

## Type Utilities

### `PropsWithChildren<T>`

Utility type for components that accept children.

```tsx
import type { PropsWithChildren } from '@kitajs/html';

function Card(props: PropsWithChildren<{ title: string }>) {
  return (
    <div class="card">
      <h2>{props.title}</h2>
      {props.children}
    </div>
  );
}
```

### `Children`

Type representing valid JSX children.

```ts
type Children = number | string | boolean | null | undefined | JSX.Element | Children[];
```

### `HtmlTag`

Base type for all HTML elements with standard attributes.

```ts
interface HtmlTag {
  children?: Children;
  safe?: boolean;
  class?: string | (string | false | null | undefined)[];
  id?: string;
  style?: string | CSSProperties;
  // ... all standard HTML attributes
}
```

## Advanced

### Custom Element Creation

Create custom JSX elements:

```tsx
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'custom-element': HtmlTag & {
        'custom-attr': string;
      };
    }
  }
}

<custom-element custom-attr="value">Content</custom-element>;
```

### Component Types

```tsx
// Function component
type Component<P = {}> = (props: P) => JSX.Element;

// Async component
type AsyncComponent<P = {}> = (props: P) => Promise<JSX.Element>;
```

## Examples

### Escaping User Input

```tsx
import { escapeHtml } from '@kitajs/html';

function Comment({ text, author }: { text: string; author: string }) {
  // Option 1: Use safe attribute
  return (
    <div class="comment">
      <strong safe>{author}</strong>: <span safe>{text}</span>
    </div>
  );

  // Option 2: Manual escaping
  return (
    <div class="comment">
      <strong>{escapeHtml(author)}</strong>: <span>{escapeHtml(text)}</span>
    </div>
  );

  // Option 3: Template literal
  return <div class="comment">{e`<strong>${author}</strong>: ${text}`}</div>;
}
```

### Building Complex HTML

```tsx
function buildTable(data: Array<{ id: number; name: string }>) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr>
            <td>{row.id}</td>
            <td safe>{row.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Next Steps

- [JSX Runtime](/api/jsx-runtime) - JSX transform internals
- [TypeScript Plugin](/api/plugins) - XSS detection plugin API
- [Getting Started](/guide/getting-started) - Set up your project
