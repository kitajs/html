# Base Templates

Most applications use a shared layout with a doctype, `<head>`, and `<body>`. In Kita
Html, layouts are regular components that accept children and slot props.

## Basic layout

```tsx
import type { PropsWithChildren } from '@kitajs/html';

function Layout({ title, children }: PropsWithChildren<{ title?: string }>) {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{title || 'My App'}</title>
        </head>
        <body>{children}</body>
      </html>
    </>
  );
}
```

The `{'<!doctype html>'}` string is concatenated before the `<html>` tag. JSX cannot
express a doctype natively, so it is inserted as a string expression.

## Slot props

For layouts with multiple content regions, use additional props for each slot.

```tsx
function Layout(
  props: PropsWithChildren<{
    title?: string;
    head?: JSX.Element;
    footer?: JSX.Element;
  }>
) {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>{props.title || 'My App'}</title>
          {props.head}
        </head>
        <body>
          {props.children}
          {props.footer}
        </body>
      </html>
    </>
  );
}

const page = (
  <Layout
    title="Home"
    head={
      <>
        <link rel="stylesheet" href="/style.css" />
        <script src="/app.js" />
      </>
    }
    footer={<footer>Copyright 2024</footer>}
  >
    <main>Page content</main>
  </Layout>
);
```

## Fastify auto-doctype

When using `@kitajs/fastify-html-plugin`, the plugin automatically prepends
`<!doctype html>` to responses that start with an `<html>` tag. This means you can omit
the manual `{'<!doctype html>'}` string in your layout when using Fastify.
