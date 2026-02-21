# Why Not Auto-Escape

In React, every JSX element is an object with a `$$typeof` symbol, a type field, and a
props object. When React renders children, it can inspect each child's type at runtime:
objects with `$$typeof` are component output and pass through unchanged, while strings are
user content and get escaped. The object wrapper is what makes auto-escaping possible.

Kita Html takes a different approach. Every JSX element evaluates to a plain `string`. A
`<div>` returns `'<div></div>'`, and a component that renders a `<div>` also returns
`'<div></div>'`. At the point where a parent element concatenates its children, there is
no runtime marker to distinguish between a string that came from a component and a string
that came from user input. Both are the same type with the same structure.

This is a fundamental consequence of the string-based architecture. Wrapping every string
in an object to enable auto-escaping would eliminate the performance advantage that makes
the library useful. The entire design relies on avoiding intermediate representations.

## How the tooling compensates

Instead of runtime auto-escaping, Kita Html shifts the responsibility to compile-time
analysis. The TypeScript plugin and CLI scanner inspect the type of every JSX child
expression. If the type is `string` or `any`, the tools emit an error. If the type is
`number`, `boolean`, `JSX.Element`, or another safe type, the expression passes without a
diagnostic.

This means the protection is type-driven rather than value-driven. A variable of type
`string` is always flagged, even if its value at runtime happens to be safe HTML. A
variable of type `number` is never flagged, because numbers cannot contain HTML. The
analysis is conservative: it produces false positives (flagging safe strings) but never
false negatives (missing unsafe ones).

The practical result is that developers must mark every point where user input enters the
JSX tree, either with the `safe` attribute or with an explicit `escapeHtml()` call. The
tooling enforces this exhaustively. Code that compiles without diagnostics and passes
`xss-scan` contains no unescaped user input unless the developer explicitly suppressed the
check.
