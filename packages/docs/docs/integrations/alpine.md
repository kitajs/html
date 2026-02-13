# Alpine.js Integration

[Alpine.js](https://alpinejs.dev/) is commonly used with HTMX for adding client-side
interactivity. We provide full type definitions for all Alpine.js directives.

## Setup

You can enable Alpine.js type definitions in two ways:

### Per-File Setup

Add this triple slash directive to the top of your file:

```tsx
/// <reference types="@kitajs/html/alpine.d.ts" />

const html = (
  // Type checking and intellisense for all Alpine directives
  <div x-data="{ open: false }">
    <button x-on:click="open = !open">Toggle</button>
    <div x-show="open">Content</div>
  </div>
);
```

### Global Setup

Add the type to your `tsconfig.json` to import the types globally:

```json
{
  "compilerOptions": {
    "types": ["@kitajs/html/alpine.d.ts"]
  }
}
```

## Full Example

```tsx
/// <reference types="@kitajs/html/alpine.d.ts" />

import fastify from 'fastify';
import fastifyHtmlPlugin from '@kitajs/fastify-html-plugin';

const app = fastify();
app.register(fastifyHtmlPlugin);

function Layout({ children }: { children: JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Alpine.js Example</title>
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}

app.get('/', (req, reply) => {
  reply.html(
    <Layout>
      <div x-data="{ count: 0 }">
        <button x-on:click="count++">Increment</button>
        <span x-text="count"></span>
      </div>
    </Layout>
  );
});

await app.listen({ port: 3000 });
```

## Common Alpine.js Patterns

### Toggle Visibility

```tsx
<div x-data="{ open: false }">
  <button x-on:click="open = !open">Toggle</button>
  <div x-show="open" x-transition>
    <p>This content can be toggled</p>
  </div>
</div>
```

### Form Handling

```tsx
<div x-data="{ name: '', email: '' }">
  <form x-on:submit.prevent="console.log({ name, email })">
    <input
      type="text"
      x-model="name"
      placeholder="Name"
    />
    <input
      type="email"
      x-model="email"
      placeholder="Email"
    />
    <button type="submit">Submit</button>
  </form>
  <p>Hello, <span x-text="name"></span>!</p>
</div>
```

### Dropdown Menu

```tsx
<div x-data="{ open: false }" x-on:click.away="open = false">
  <button x-on:click="open = !open">
    Open Menu
  </button>
  <div x-show="open" x-transition>
    <a href="#1">Item 1</a>
    <a href="#2">Item 2</a>
    <a href="#3">Item 3</a>
  </div>
</div>
```

### Tabs

```tsx
<div x-data="{ tab: 'tab1' }">
  <div>
    <button x-on:click="tab = 'tab1'" x-bind:class="{ 'active': tab === 'tab1' }">
      Tab 1
    </button>
    <button x-on:click="tab = 'tab2'" x-bind:class="{ 'active': tab === 'tab2' }">
      Tab 2
    </button>
  </div>

  <div x-show="tab === 'tab1'" x-transition>
    Tab 1 content
  </div>
  <div x-show="tab === 'tab2'" x-transition>
    Tab 2 content
  </div>
</div>
```

## Combining with HTMX

Alpine.js works great alongside HTMX:

```tsx
/// <reference types="@kitajs/html/htmx.d.ts" />
/// <reference types="@kitajs/html/alpine.d.ts" />

<div x-data="{ loading: false }">
  <button
    hx-get="/api/data"
    hx-target="#content"
    x-on:htmx:before-request="loading = true"
    x-on:htmx:after-request="loading = false"
  >
    Load Data
  </button>

  <div x-show="loading">Loading...</div>
  <div id="content"></div>
</div>
```

## Alpine.js Directives

All Alpine.js directives are fully typed:

### Core Directives

```tsx
// Data binding
<div x-data="{ foo: 'bar' }">

// Show/Hide
<div x-show="condition">

// Text content
<div x-text="message">

// HTML content
<div x-html="htmlString">

// Model binding
<input x-model="value" />

// Event handling
<button x-on:click="handleClick">

// Attribute binding
<div x-bind:class="className">

// Conditional rendering
<template x-if="condition">
  <div>Content</div>
</template>

// Loops
<template x-for="item in items">
  <div x-text="item"></div>
</template>
```

### Advanced Directives

```tsx
// Transitions
<div x-show="open" x-transition>

// Effects
<div x-effect="console.log(count)">

// Refs
<div x-ref="myDiv">

// Cloak (hide until Alpine loads)
<div x-cloak>

// Ignore
<div x-ignore>
```

## Type Safety

TypeScript provides full intellisense for Alpine directives:

```tsx
// ✓ Valid directives
<div x-data="{}" />
<div x-show="true" />
<div x-text="'hello'" />

// ✗ TypeScript error for invalid directives
<div x-invalid="value" />
```

## Resources

- [Alpine.js Documentation](https://alpinejs.dev/)
- [Alpine.js Examples](https://alpinejs.dev/examples)
- [Alpine.js Plugins](https://alpinejs.dev/plugins)

## Next Steps

- Try [HTMX integration](/integrations/htmx)
- Learn about [Hotwire Turbo](/integrations/turbo)
- Explore [Base HTML Templates](/integrations/base-templates)
