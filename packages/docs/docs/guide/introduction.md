# Introduction

KitaJS Html is a **super-fast JSX runtime** that generates HTML strings directly, without
the overhead of a virtual DOM. It's designed for server-side rendering and provides an
elegant, type-safe way to generate HTML.

## What is KitaJS Html?

Unlike React which builds a virtual DOM and then renders it to HTML, KitaJS Html takes JSX
syntax and immediately produces HTML strings. This makes it:

- ⚡ **10-40x faster** than React's server-side rendering
- 📦 **Zero runtime dependencies** - just pure string generation
- 🎯 **Fully type-safe** with TypeScript JSX definitions
- 🔒 **XSS-protected** with compile-time vulnerability detection

## How It Works

```tsx
// Your TSX code
const html = <div class="hello">{name}</div>;

// TypeScript compiles it to:
jsx('div', { class: 'hello', children: name });

// Which returns a string:
('<div class="hello">Arthur</div>');
```

That's it! No virtual DOM, no reconciliation, no hydration. Just fast, straightforward
HTML string generation.

## Key Features

### 🛡️ Built-in XSS Protection

The TypeScript plugin catches XSS vulnerabilities **at development time**:

```tsx
const userInput: string = req.body.comment;

// ❌ Error: Unsafe content
<div>{userInput}</div>

// ✅ Safe with escaping
<div safe>{userInput}</div>
```

Learn more about [XSS Protection](/guide/xss-protection/overview).

### 🔄 Async Components & Suspense

Full support for async/await with streaming Suspense:

```tsx
async function UserProfile({ id }: { id: string }) {
  const user = await db.getUser(id);
  return <div safe>{user.name}</div>;
}

// With Suspense streaming
<Suspense rid={req.id} fallback={<Loading />}>
  <UserProfile id="123" />
</Suspense>;
```

Learn more about [Async Components](/guide/features/async-components).

### 🎨 Familiar JSX Syntax

If you know React JSX, you already know KitaJS Html:

```tsx
function Card({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div class="card">
      <h2 safe>{title}</h2>
      {children}
    </div>
  );
}
```

Learn more about [JSX Syntax](/guide/features/jsx-syntax).

## Use Cases

Perfect for:

- **Server-side rendering** - Generate HTML on the server efficiently
- **Email templates** - Create HTML emails with JSX
- **Static site generation** - Build static HTML files
- **HTMX applications** - Return HTML fragments from API endpoints
- **Template engines** - Replace EJS, Pug, or Handlebars

## Quick Start

Ready to start using KitaJS Html? Head over to the
[Getting Started guide](/guide/getting-started) to set up your project.

## Learn More

- [Getting Started](/guide/getting-started) - Install and configure
- [XSS Protection](/guide/xss-protection/overview) - Security best practices
- [JSX Syntax](/guide/features/jsx-syntax) - All JSX features
- [Integrations](/integrations/overview) - Framework and library integrations
- [Benchmark](/guide/features/benchmark) - Performance comparisons
