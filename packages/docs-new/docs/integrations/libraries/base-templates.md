# Base HTML Templates

Often you will have a "template" HTML with doctype, things in the head, body, and so on.
Most users try to use them as a raw string and only use JSX for other components, but this
is not a good idea as
[you will have problems with it](https://github.com/nicojs/typed-html/issues/46).

But you can always concatenate strings, which is the recommended approach for handling
doctypes and base templates.

## Basic Layout Component

```tsx
import type { PropsWithChildren } from '@kitajs/html';

export function Layout(props: PropsWithChildren<{ head?: string; title?: string }>) {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{props.title || 'Hello World!'}</title>
          {props.head}
        </head>
        <body>{props.children}</body>
      </html>
    </>
  );
}
```

## Usage Example

```tsx
const html = (
  <Layout
    title="My Page"
    head={
      <>
        <link rel="stylesheet" href="/style.css" />
        <script src="/script.js" />
      </>
    }
  >
    <div>
      <h1>Hello World</h1>
      <p>Welcome to my page!</p>
    </div>
  </Layout>
);
```

## Advanced Layout with Slots

You can create more flexible layouts using multiple slots:

```tsx
type LayoutProps = PropsWithChildren<{
  title?: string;
  description?: string;
  styles?: JSX.Element;
  scripts?: JSX.Element;
  header?: JSX.Element;
  footer?: JSX.Element;
}>;

export function AdvancedLayout(props: LayoutProps) {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content={props.description || 'My awesome site'} />
          <title>{props.title || 'My Site'}</title>

          {/* Default styles */}
          <link rel="stylesheet" href="/global.css" />
          {props.styles}
        </head>
        <body>
          {props.header || (
            <header>
              <nav>
                <a href="/">Home</a>
                <a href="/about">About</a>
              </nav>
            </header>
          )}

          <main>{props.children}</main>

          {props.footer || (
            <footer>
              <p>&copy; 2026 My Site</p>
            </footer>
          )}

          {/* Default scripts */}
          <script src="/global.js" />
          {props.scripts}
        </body>
      </html>
    </>
  );
}
```

### Usage

```tsx
<AdvancedLayout
  title="Blog Post"
  description="An interesting blog post"
  styles={
    <>
      <link rel="stylesheet" href="/blog.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
    </>
  }
  scripts={
    <>
      <script src="/comments.js" />
      <script src="/analytics.js" />
    </>
  }
>
  <article>
    <h1>My Blog Post</h1>
    <p>Content here...</p>
  </article>
</AdvancedLayout>
```

## Nested Layouts

You can compose layouts for different sections of your site:

```tsx
function AppLayout({ children }: PropsWithChildren) {
  return (
    <Layout
      title="My App"
      head={
        <>
          <link rel="stylesheet" href="/app.css" />
          <script src="https://unpkg.com/htmx.org@1.9.10"></script>
        </>
      }
    >
      <div class="app">
        <aside class="sidebar">
          <nav>
            <a href="/dashboard">Dashboard</a>
            <a href="/profile">Profile</a>
            <a href="/settings">Settings</a>
          </nav>
        </aside>
        <main class="content">{children}</main>
      </div>
    </Layout>
  );
}

function DashboardPage() {
  return (
    <AppLayout>
      <h1>Dashboard</h1>
      <div class="widgets">
        <Widget title="Users" count={150} />
        <Widget title="Posts" count={2500} />
      </div>
    </AppLayout>
  );
}
```

## Layout with HTMX

```tsx
/// <reference types="@kitajs/html/htmx.d.ts" />

function HtmxLayout({ children }: PropsWithChildren<{ title?: string }>) {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{props.title || 'HTMX App'}</title>
          <script src="https://unpkg.com/htmx.org@1.9.10"></script>
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body hx-boost="true" hx-ext="debug">
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>

          <main id="content">{children}</main>

          <div id="notifications"></div>
        </body>
      </html>
    </>
  );
}
```

## Layout with Alpine.js

```tsx
/// <reference types="@kitajs/html/alpine.d.ts" />

function AlpineLayout({ children }: PropsWithChildren) {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Alpine App</title>
          <script
            defer
            src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
          ></script>
        </head>
        <body x-data="{ darkMode: false }" x-bind:class="darkMode ? 'dark' : ''">
          <header>
            <button x-on:click="darkMode = !darkMode">Toggle Dark Mode</button>
          </header>

          <main>{children}</main>
        </body>
      </html>
    </>
  );
}
```

## Fastify Auto-Doctype

When using the Fastify plugin, doctype is added automatically:

```tsx
import fastifyHtmlPlugin from '@kitajs/fastify-html-plugin';

app.register(fastifyHtmlPlugin, {
  autoDoctype: true // default
});

app.get('/', (req, reply) => {
  // No need to add <!doctype html>
  reply.html(
    <html lang="en">
      <body>Hello World</body>
    </html>
  );
  // Automatically becomes: <!doctype html><html lang="en">...
});
```

You can disable it per-request:

```tsx
import { kAutoDoctype } from '@kitajs/fastify-html-plugin';

app.get('/fragment', (req, reply) => {
  reply[kAutoDoctype] = false;
  reply.html(<div>Just a fragment</div>);
});
```

## SEO Meta Tags

Create a layout with proper SEO meta tags:

```tsx
type SEOProps = PropsWithChildren<{
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}>;

function SEOLayout(props: SEOProps) {
  const url = props.url || 'https://example.com';
  const image = props.image || 'https://example.com/og-image.png';

  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          {/* Primary Meta Tags */}
          <title>{props.title}</title>
          <meta name="title" content={props.title} />
          <meta name="description" content={props.description} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content={props.type || 'website'} />
          <meta property="og:url" content={url} />
          <meta property="og:title" content={props.title} />
          <meta property="og:description" content={props.description} />
          <meta property="og:image" content={image} />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={url} />
          <meta property="twitter:title" content={props.title} />
          <meta property="twitter:description" content={props.description} />
          <meta property="twitter:image" content={image} />
        </head>
        <body>{props.children}</body>
      </html>
    </>
  );
}
```

## Next Steps

- Learn about [Fastify integration](/integrations/frameworks/fastify)
- Try [HTMX](/integrations/libraries/htmx) for dynamic updates
- Add [Alpine.js](/integrations/libraries/alpine) for interactivity
