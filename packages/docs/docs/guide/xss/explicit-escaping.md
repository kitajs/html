---
description:
  Why Kita Html uses explicit escaping with compile-time checks instead of runtime
  auto-escaping.
---

# Explicit escaping by design

Kita Html renders JSX directly to strings. That design is what makes rendering fast, but
it also removes the runtime object wrapper that frameworks like React use to auto-escape
children safely.

## Auto-escaping requires runtime objects

In React, every JSX element is an object with a `$$typeof` symbol, a type field, and a
props object. When React renders children, it can inspect each child's type at runtime:
objects with `$$typeof` are component output and pass through unchanged, while strings are
user content and get escaped. The object wrapper is what makes auto-escaping possible.

Kita Html takes a different approach. Every JSX element evaluates to a plain `string`. A
`<div>` returns `'<div></div>'`, and a component that renders a `<div>` also returns
`'<div></div>'`. At the point where a parent element concatenates its children, there is
no runtime marker to distinguish between a string that came from a component and a string
that came from user input.

## Escaping at the entry point

Wrapping every string in an object to enable auto-escaping would remove most of the
performance advantage.

Instead, escaping happens at the point where data enters the JSX tree. Use the `safe`
attribute for native element children, or `escapeHtml()` when passing escaped content
through components.

## Compile-time checks

Kita Html shifts most of the safety work to compile-time analysis. `kita-html check`
inspects the type of every JSX child expression. If the type is `string` or `any`, the
tools emit an error. If the type is `number`, `boolean`, `JSX.Element`, or another safe
type, the expression passes without a diagnostic.

This is a trade-off. Type-driven checks in a structurally typed language are not as strong
as runtime checks on real values, especially when code uses `any`, type assertions,
incorrect declarations, or suppressed diagnostics. The tooling is designed to be
conservative: it may flag strings that are safe at runtime.
