---
description:
  Why Kita Html uses explicit escaping with compile-time checks instead of runtime
  auto-escaping.
---

# Explicit Escaping by Design

Kita Html renders JSX directly to strings. That design is what makes rendering fast, but
it also removes the runtime object wrapper that frameworks like React use to auto-escape
children safely.

## Why auto-escaping needs runtime objects

In React, every JSX element is an object with a `$$typeof` symbol, a type field, and a
props object. When React renders children, it can inspect each child's type at runtime:
objects with `$$typeof` are component output and pass through unchanged, while strings are
user content and get escaped. The object wrapper is what makes auto-escaping possible.

Kita Html takes a different approach. Every JSX element evaluates to a plain `string`. A
`<div>` returns `'<div></div>'`, and a component that renders a `<div>` also returns
`'<div></div>'`. At the point where a parent element concatenates its children, there is
no runtime marker to distinguish between a string that came from a component and a string
that came from user input. Both are the same type with the same structure.

## Why escaping is explicit

This is a fundamental consequence of the string-based architecture. Wrapping every string
in an object to enable auto-escaping would eliminate the performance advantage that makes
the library useful. The entire design relies on avoiding intermediate representations.

Instead, escaping happens at the point where data enters the JSX tree. Use the `safe`
attribute for native element children, or `escapeHtml()` when passing escaped content
through components.

## How tooling closes the gap

Instead of runtime auto-escaping, Kita Html shifts most of the safety work to compile-time
analysis. The TypeScript plugin and CLI scanner inspect the type of every JSX child
expression. If the type is `string` or `any`, the tools emit an error. If the type is
`number`, `boolean`, `JSX.Element`, or another safe type, the expression passes without a
diagnostic.

This is a tradeoff. Type-driven checks in a structurally typed language are not as strong
as runtime checks on real values, especially when code uses `any`, type assertions,
incorrect declarations, or suppressed diagnostics. The tooling is designed to be
conservative: it may flag strings that are safe at runtime, and it is backed by extensive
tests that cover the supported safe and unsafe patterns.

The practical result is that developers must mark every point where user input enters the
JSX tree, either with the `safe` attribute or with an explicit `escapeHtml()` call. The
editor plugin, `xss-scan`, and the runtime escaping helpers work together to make unsafe
rendering difficult to introduce accidentally, while still preserving direct string
rendering.
