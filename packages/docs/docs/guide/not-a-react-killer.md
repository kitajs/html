---
description:
  Why Kita Html is not a React replacement, where it fits best, and when React remains the
  better choice.
---

# Not a React killer

React is a client UI runtime with a large ecosystem built around interactivity, state,
hydration, and long-lived application trees. Kita Html is a string-based JSX runtime that
turns component trees into HTML with as little runtime overhead as possible. Both use JSX,
but they target different workloads.

## Choosing between them

Choose Kita Html when the final artifact you need is HTML. Choose React when the UI is
primarily client-driven and long-lived.

| Prefer Kita Html for                    | Prefer React for                        |
| --------------------------------------- | --------------------------------------- |
| Server-side rendered pages              | Complex client-side interactions        |
| HTMX-style applications                 | Large stateful interfaces               |
| Email templates                         | Rich browser-only behavior              |
| Static HTML generation                  | Component-heavy frontend apps           |
| HTTP handlers that return HTML directly | Hydrated client-side applications       |
| Low-bundling or no-bundling setups      | Ecosystem-heavy application development |

For the left column, the lack of a virtual DOM and of a client runtime is an advantage.

## Trade-offs

Kita Html is fast because it keeps the runtime small and focused. That same design means
it does not provide client reactivity, client routing, or a browser-side component model.
It is closer to a templating engine with JSX ergonomics than to a full client application
framework.
