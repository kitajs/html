# What is Kita Html

Kita Html is a JSX runtime where every element evaluates to a string. Where React's
`<div />` produces a virtual DOM node that must be reconciled and serialized, Kita Html's
`<div />` returns `'<div></div>'` directly. There is no intermediate representation, no
diffing step, and no serialization pass. The JSX you write compiles to function calls that
concatenate strings.

This architecture makes Kita Html significantly faster than virtual DOM-based renderers
for any scenario where the output is an HTML string: server-side rendering, static site
generation, email templates, HTMX applications, or any HTTP handler that sends HTML over
the wire.

## Performance through simplicity

A virtual DOM renderer performs three operations per render cycle: it constructs an object
tree, diffs it against the previous tree, and serializes the result to a string. Kita Html
skips all three. The TypeScript compiler rewrites JSX expressions into `jsx()` and
`jsxs()` function calls at build time. At runtime, those functions concatenate attribute
strings and child strings into a single result. The output is the final HTML with no
post-processing.

```tsx
// What you write
<div class="card">
  <h1 safe>{title}</h1>
</div>;

// What TypeScript compiles to
jsx('div', { class: 'card', children: jsx('h1', { safe: true, children: title }) });

// What the runtime returns
('<div class="card"><h1>Escaped Title</h1></div>');
```

This directness is why Kita Html benchmarks 7-40x faster than React's `renderToString`
across real-world component trees. The runtime has zero dependencies beyond TypeScript
itself.

## XSS protection

Because `JSX.Element` is a `string`, the runtime cannot distinguish between HTML produced
by a component and raw user input injected as a child. Children are not escaped by
default. This is a deliberate trade-off for performance and composability, and it is fully
addressed by three layers of protection that work together to make accidental XSS
practically impossible.

The `safe` attribute escapes children at render time. Adding it to any native element
causes the runtime to pass all children through HTML entity escaping before concatenation.

```tsx
<div safe>{userInput}</div>
// Renders: <div>&lt;script&gt;...&lt;/script&gt;</div>
```

A TypeScript language service plugin analyzes every JSX expression in your editor and
flags any child whose type could carry unescaped HTML. The same analysis runs as a CLI
tool (`xss-scan`) in CI/CD pipelines, failing the build on any finding. Between the editor
diagnostics and the CI gate, unsafe expressions are caught before they reach production.
The only way to ship XSS-vulnerable code is to explicitly suppress the warnings.

## Async components and Suspense

Kita Html supports async components natively. Any function component that returns a
`Promise<string>` is valid JSX. When an async child appears anywhere in the tree, the
entire parent chain becomes a `Promise<string>` through automatic propagation.

```tsx
async function UserCard({ id }: { id: string }) {
  const user = await db.getUser(id);
  return <div safe>{user.name}</div>;
}

// The result is a Promise<string> because UserCard is async
const html = <UserCard id="123" />;
```

For streaming scenarios, the Suspense component renders a fallback immediately and
replaces it with the resolved content as each async subtree completes. This uses HTTP
chunked transfer encoding to stream updates to the client without waiting for the entire
page to resolve. A small inline script handles the client-side DOM replacement.

```tsx
import { Suspense, renderToStream } from '@kitajs/html/suspense';

const stream = renderToStream((rid) => (
  <Suspense rid={rid} fallback={<div>Loading...</div>}>
    <UserCard id="123" />
  </Suspense>
));

// Pipe the stream to your HTTP response
```

Each Suspense boundary operates independently, so fast components appear instantly while
slow ones show their fallback. The `rid` parameter ties each Suspense instance to a
specific request for safe concurrent rendering.

## Packages

Kita Html ships as three packages. `@kitajs/html` is the core runtime that compiles JSX to
strings and provides Suspense streaming. `@kitajs/ts-html-plugin` is the TypeScript plugin
and CLI scanner for XSS detection.

Official [framework integrations](/integrations/overview) are available for Fastify,
Elysia, and others. The core runtime works with any framework that accepts strings.
