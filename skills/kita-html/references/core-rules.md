# Core Rules

Use this when you need the runtime model, JSX behavior, and non-React gotchas.

Latest docs:

- Doc link, introduction raw markdown: `https://html.kitajs.org/guide/introduction.md`
- Doc link, JSX syntax raw markdown: `https://html.kitajs.org/guide/jsx/syntax.md`
- Doc link, async components raw markdown:
  `https://html.kitajs.org/guide/async/async-components.md`
- Doc link, design decisions raw markdown:
  `https://html.kitajs.org/guide/jsx/design-decisions.md`

These doc links are the most up-to-date reference if this file and the docs ever diverge.

## Mental model

- Kita Html compiles JSX to string-building runtime calls.
- `JSX.Element` is `string | Promise<string>`.
- Function components return final HTML strings, not virtual DOM nodes.
- One async child makes the containing tree async.

## Not React

Do not assume:

- virtual DOM nodes
- hooks or client lifecycle
- React SSR APIs like `renderToString`
- automatic child escaping
- React Suspense semantics

## JSX behavior that matters

- Arrays are concatenated with no separator.
- `class` accepts arrays such as `['card', isActive && 'active', size]`.
- `style` accepts a string or an object. Object keys become kebab-case CSS.
- Use `<tag of="my-element">` when the tag name is dynamic or kebab-case custom-element
  syntax is needed.
- `bigint` renders as text.
- Plain objects as children are invalid.

## Safe defaults for generated code

- Prefer `class` over `className` unless the surrounding file consistently uses
  `className`.
- Prefer small composable function components.
- For full pages without a framework plugin, emit `{'<!doctype html>'}` manually before
  `<html>`.
- Keep output server-oriented. Kita is best for SSR, templates, emails, HTMX-style apps,
  and static pages.

## Async model

- Async components are normal components that return `Promise<string>`.
- Await only when a plain string is required by the surrounding code.
- Fastify and Express integrations can accept promised JSX directly through their HTML
  helpers.

## Error model

- `Suspense catch` handles errors from async children.
- `ErrorBoundary` handles async failures and timeout-related failures.
- Sync render errors still need normal `try/catch` patterns.
