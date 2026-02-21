# Error Boundaries

Error boundaries catch errors thrown by async components and render a fallback instead of
crashing the entire tree.

## Usage

Import `ErrorBoundary` from `@kitajs/html/error-boundary` and wrap async components. The
`catch` prop accepts a JSX element or a function that receives the error.

```tsx
import { ErrorBoundary } from '@kitajs/html/error-boundary';

async function UserProfile({ id }: { id: string }) {
  const user = await db.getUser(id); // may reject
  return <div safe>{user.name}</div>;
}

const html = await (
  <ErrorBoundary catch={(err) => <div>Error: {String(err)}</div>}>
    <UserProfile id="123" />
  </ErrorBoundary>
);
```

If `UserProfile` throws, the boundary renders the catch fallback. If it succeeds, the
boundary renders the component output unchanged.

## Sync components

Error boundaries only catch errors from async components, because synchronous errors
propagate before the boundary can intercept them. For synchronous components, use a
standard try/catch.

```tsx
function SyncComponent() {
  try {
    const data = riskyOperation();
    return <div>{data}</div>;
  } catch (err) {
    return <div>Error: {String(err)}</div>;
  }
}
```

## Combining with Suspense

Error boundaries and Suspense serve different purposes and are used together. Suspense's
`catch` prop handles errors from its async children. An `ErrorBoundary` wrapping the
Suspense handles errors from the fallback itself.

```tsx
<ErrorBoundary catch={<div>Fallback failed</div>}>
  <Suspense rid={rid} fallback={<AsyncFallback />} catch={<div>Children failed</div>}>
    <AsyncContent />
  </Suspense>
</ErrorBoundary>
```

If `AsyncContent` throws, Suspense renders "Children failed". If `AsyncFallback` throws,
the ErrorBoundary renders "Fallback failed". These are independent error paths.
