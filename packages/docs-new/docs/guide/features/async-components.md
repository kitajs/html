# Async Components

`async`/`await` inside components are 100% supported.

When any child or sub child of a component tree is a `Promise<string>`, the whole tree
will return a promise of html string. If no async components are found, the result will be
simply a string, and you can safely cast it into a string.

```tsx
import assert from 'node:assert';
import { setTimeout } from 'node:timers/promises';

async function Async() {
  await setTimeout(1000); // simulates work
  return <div>Async!</div>;
}

function Sync() {
  return <div>Sync!</div>;
}

const async = (
  <div>
    <Async />
  </div>
);

assert(async instanceof Promise);

const sync = (
  <div>
    <Sync />
  </div>
);

assert(typeof sync === 'string');
```

A `JSX.Element` will always be a string. Once a children element is an async component,
the entire upper tree will also be async.

## Suspense Component

The only problem when rendering templates is that you must wait for the whole template to
be rendered before sending it to the client. This is not a problem for small templates,
but it can be a problem for large templates.

To solve this problem, we provide a `Suspense` component that combined with
`renderToStream()` rendering method, will stream a fallback component while it waits for
its children to be rendered.

```tsx
import { Suspense, renderToStream } from '@kitajs/html/suspense';

function renderUserPage(rid: number | string) {
  return (
    <Suspense
      rid={rid}
      fallback={<div>Loading username...</div>}
      catch={(err) => <div>Error: {String(err)}</div>}
    >
      <MyAsyncComponent />
    </Suspense>
  );
}

// Html is a string readable stream that can be piped to the client
const html = renderToStream(renderUserPage);
```

The above example would render `<div>Loading username...</div>` while waiting for the
`MyAsyncComponent` to be rendered.

When using `Suspense`, you cannot just call the component and get the html string, you
need to use the `renderToStream` function to get a stream that can be piped to the client
with updates. Otherwise, the fallback would render forever.

As the result of any JSX component is always a string, you must use the `rid` provided by
`renderToStream` into all your suspense components, this way we can identify which
suspense is for which request and be able to render concurrent requests.

### Async Fallbacks

Suspense also accepts async fallbacks, but it blocks rendering until the fallback is
resolved.

```tsx
import { Suspense } from '@kitajs/html/suspense';

function renderTemplate(rid: number | string) {
  return (
    <Suspense
      rid={rid}
      fallback={<MyAsyncFallback />}
      catch={(err) => <div>Error: {String(err)}</div>}
    >
      <MyAsyncComponent />
    </Suspense>
  );
}
```

The above example would only return anything after `MyAsyncFallback` is resolved. To catch
async fallback errors, you must wrap it into an [`ErrorBoundary`](#error-boundaries).

:::tip HTTP Chunked Transfer HTTP chunked transfer encoding is handled automatically by
Node.js (and other runtimes) when streaming responses without a `Content-Length` header.
You don't need to configure anything for this to work. :::

## Error Boundaries

The same way as promises must be awaited to resolve its own html, errors must be caught.
Outside of [suspense](#suspense-component) components, you can use the provided error
boundaries to catch errors.

```tsx
import { ErrorBoundary } from '@kitajs/html/error-boundary';

function renderTemplate() {
  return (
    <ErrorBoundary catch={(err) => <div>Error: {String(err)}</div>}>
      <MyAsyncComponent />
    </ErrorBoundary>
  );
}

// If MyAsyncComponent throws an error, it will render <div>Error: ...</div>
const html = await renderTemplate();
```

Error boundaries will only work for errors thrown inside async components, for sync
components you must use `try`/`catch`.

```tsx
function MySyncComponent() {
  try {
    const data = syncDbQuery();
    return <Username name={data.username} />;
  } catch (err) {
    return <div>Error: {String(err)}</div>;
  }
}
```

### Error Boundaries with Suspense

Error boundaries outside suspense components will only catch errors thrown by the fallback
component. You must use the Suspense's `catch` property to handle errors thrown by its
children components.

```tsx
import { ErrorBoundary } from '@kitajs/html/error-boundary';
import { renderToStream, Suspense } from '@kitajs/html/suspense';

function renderTemplate(rid: number | string) {
  return (
    <ErrorBoundary catch={<div>Only catches fallback errors</div>}>
      <Suspense
        rid={rid}
        fallback={<MyAsyncFallback />}
        catch={<div>Catches children errors</div>}
      >
        <MyAsyncComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

const html = renderToStream(renderTemplate);
```

The above example would render `<div>Catches children errors</div>` if `MyAsyncComponent`
throws an error, or `<div>Only catches fallback errors</div>` if `MyAsyncFallback` throws
an error.

## Why JSX.Element is a Promise?

:::info TypeScript Limitation Until
[#14729](https://github.com/microsoft/TypeScript/issues/14729) gets implemented, you need
to manually cast `JSX.Element` into strings if you are sure there is no inner async
components in your component tree. :::

JSX elements are mostly strings everywhere. However, as the nature of this package, once a
children element is an async component, the entire upper tree will also be async. Unless
you are sure that no other component in your entire codebase is async, you should always
handle both string and promise cases.

```tsx
// It may or may not have inner async components.
const html = <MyAsyncComponent />;

if (html instanceof Promise) {
  // I'm a promise, I should be awaited
  console.log(await html);
} else {
  // I'm a string, I can be used as is
  console.log(html);
}
```

## API Reference

### `renderToStream`

Transforms a component tree who may contain `Suspense` components into a stream of HTML.

There are two ways of using `renderToStream`:

**With a `rid` parameter**, to identify which suspense is for which request.

If you are using a framework that already generates a unique request id per request, like
[Fastify's request.id](https://fastify.dev/docs/latest/Reference/Request/), you can simply
render your component tree with it and pass it to `renderToStream`.

```tsx
import { renderToStream } from '@kitajs/html/suspense';

let requestId = 0;

function handleRequest() {
  const rid = requestId++;
  const html = renderToStream(<LayoutWithSuspense rid={rid} />, rid);
  // pipe html to the client
}
```

**With a callback**, if you do not have easy access to a unique request id.

You can pass a callback as the first parameter to `renderToStream` that will be called
with the request id.

```tsx
import { renderToStream } from '@kitajs/html/suspense';

function handleRequest() {
  const html = renderToStream((rid) => <LayoutWithSuspense rid={rid} />);
  // pipe html to the client
}
```

### `renderToString`

Just like `renderToStream`, but only resolves when the whole tree is rendered.

:::warning Performance This method completely throws away the suspense feature, and will
render the whole tree before returning the string.

This is only useful for testing environments or when you don't care about the time it
takes to render the whole tree. :::

```tsx
import { renderToString } from '@kitajs/html/suspense';

async function handleRequest() {
  const html: string = await renderToString((rid) => <LayoutWithSuspense rid={rid} />);
}
```

## Next Steps

- Integrate with [Fastify](/integrations/frameworks/fastify) for streaming support
- Learn about [HTMX](/integrations/libraries/htmx) integration
- Check out the [Benchmark](/guide/features/benchmark)
