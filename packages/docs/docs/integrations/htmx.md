# HTMX Integration

The usage of [htmx.org](https://htmx.org/) is super common with this project, which is why
we provide type definitions for all HTMX attributes.

## Setup

You can enable HTMX type definitions in two ways:

### Per-File Setup

Add this triple slash directive to the top of your file:

```tsx
/// <reference types="@kitajs/html/htmx.d.ts" />

const html = (
  // Type checking and intellisense for all HTMX attributes
  <div hx-get="/api" hx-trigger="click" hx-target="#target">
    Click me!
  </div>
);
```

### Global Setup

Add the type to your `tsconfig.json` to import the types globally:

```json
{
  "compilerOptions": {
    "types": ["@kitajs/html/htmx.d.ts"]
  }
}
```

## Full Example

```tsx
/// <reference types="@kitajs/html/htmx.d.ts" />

import fastify from 'fastify';
import fastifyHtmlPlugin from '@kitajs/fastify-html-plugin';

const app = fastify();
app.register(fastifyHtmlPlugin);

// Layout with HTMX script
function Layout({ children }: { children: JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>HTMX Example</title>
        <script src="https://unpkg.com/htmx.org@1.9.10"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}

// Main page with HTMX
app.get('/', (req, reply) => {
  reply.html(
    <Layout>
      <h1>HTMX Example</h1>
      <button hx-get="/api/data" hx-target="#content" hx-swap="innerHTML">
        Load Data
      </button>
      <div id="content">Click the button to load data</div>
    </Layout>
  );
});

// API endpoint returning HTML fragment
app.get('/api/data', (req, reply) => {
  reply.html(
    <div>
      <h2>Dynamic Content</h2>
      <p>Loaded via HTMX!</p>
    </div>
  );
});

await app.listen({ port: 3000 });
```

## Common HTMX Patterns

### GET Requests

```tsx
<button hx-get="/api/users" hx-target="#user-list" hx-swap="innerHTML">
  Load Users
</button>
```

### POST Requests

```tsx
<form hx-post="/api/users" hx-target="#result">
  <input type="text" name="name" />
  <button type="submit">Submit</button>
</form>
```

### Triggers

```tsx
<input
  type="search"
  name="q"
  hx-get="/api/search"
  hx-trigger="keyup changed delay:500ms"
  hx-target="#results"
/>
```

### Delete with Confirmation

```tsx
<button
  hx-delete="/api/users/123"
  hx-confirm="Are you sure?"
  hx-target="#user-123"
  hx-swap="outerHTML"
>
  Delete
</button>
```

### Polling

```tsx
<div hx-get="/api/status" hx-trigger="every 2s" hx-target="this" hx-swap="innerHTML">
  Loading status...
</div>
```

## Advanced Example with Suspense

Combine HTMX with Suspense for progressive enhancement:

```tsx
import { Suspense } from '@kitajs/html/suspense';

async function UserList() {
  const users = await db.getUsers();
  return (
    <ul id="user-list">
      {users.map((user) => (
        <li>
          <span safe>{user.name}</span>
          <button
            hx-delete={`/api/users/${user.id}`}
            hx-target="closest li"
            hx-swap="outerHTML"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

app.get('/', (req, reply) => {
  reply.html(
    <Layout>
      <h1>Users</h1>
      <Suspense rid={req.id} fallback={<div>Loading users...</div>}>
        <UserList />
      </Suspense>
      <button hx-get="/api/user-form" hx-target="#form-container" hx-swap="innerHTML">
        Add User
      </button>
      <div id="form-container"></div>
    </Layout>
  );
});
```

## Type-Safe HTMX Attributes

All HTMX attributes are fully typed:

```tsx
// ✓ Valid attributes
<div hx-get="/api" />
<div hx-post="/api" />
<div hx-put="/api" />
<div hx-patch="/api" />
<div hx-delete="/api" />

// ✓ Valid swap strategies
<div hx-swap="innerHTML" />
<div hx-swap="outerHTML" />
<div hx-swap="beforebegin" />
<div hx-swap="afterbegin" />
<div hx-swap="beforeend" />
<div hx-swap="afterend" />

// ✓ Valid triggers
<div hx-trigger="click" />
<div hx-trigger="load" />
<div hx-trigger="revealed" />
<div hx-trigger="every 2s" />

// ✗ TypeScript error for invalid values
<div hx-swap="invalid" />
```

## Resources

- [HTMX Documentation](https://htmx.org/docs/)
- [HTMX Examples](https://htmx.org/examples/)
- [Hypermedia Systems Book](https://hypermedia.systems/)

## Next Steps

- Try [Alpine.js integration](/integrations/alpine)
- Learn about [Hotwire Turbo](/integrations/turbo)
- Explore [Base HTML Templates](/integrations/base-templates)
