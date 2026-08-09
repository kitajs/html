---
description:
  Why Kita Html is not a React replacement, where it fits best, and when React remains the
  better choice.
---

# Not a React Killer

Kita Html is not a React replacement. It solves a different problem.

React is a client UI runtime with a large ecosystem built around interactivity, state,
hydration, and long-lived application trees. Kita Html is a string-based JSX runtime that
turns component trees into HTML with as little runtime overhead as possible. Both use JSX,
but they target different workloads.

## Good use cases for Kita Html

Choose Kita Html when the final artifact you need is HTML. Its strengths come from direct
string generation, minimal runtime work, and the absence of a client-side rendering model.

| Prefer Kita Html for                    | Prefer React for                        |
| --------------------------------------- | --------------------------------------- |
| Server-side rendered pages              | Complex client-side interactions        |
| HTMX-style applications                 | Large stateful interfaces               |
| Email templates                         | Rich browser-only behavior              |
| Static HTML generation                  | Component-heavy frontend apps           |
| HTTP handlers that return HTML directly | Hydrated client-side applications       |
| Low-bundling or no-bundling setups      | Ecosystem-heavy application development |

In some cases, the lack of a virtual DOM and the lack of a client runtime are advantages.
**That is where Kita Html shines.**

## Good use cases for React

Choose React when the UI is primarily client-driven and long-lived. React still wins when
you need rich interactivity, complex local state, broad third-party component ecosystems,
or application patterns built around hydration and client-side updates.

If you want React, use React. Kita Html does not try to out-React React.

## What you give up

Kita Html is fast because it keeps the runtime small and focused. That same design means
it does not provide strong client reactivity, client routing, or a browser-side component
model. It is closer to a templating engine with JSX ergonomics than to a full client
application framework.

The question is not whether Kita Html is better than React. The question is what kind of
problem you are solving: generating HTML on the server, or running an interactive app in
the browser.

If Kita Html has been a good fit for your work,
[share what you built](https://github.com/kitajs/html/discussions/496).
