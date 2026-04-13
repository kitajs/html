---
description:
  Architectural rationale for omitting context and for defining JSX.Element as string or
  Promise<string>.
---

# Design Decisions

This page documents the major architectural decisions in Kita Html and their rationale.

## Why there is no context API

Kita Html only produces strings or promises of strings. It does not manage lifecycle,
state, or render cycles. The primary use case for a context API in other JSX frameworks is
to avoid prop drilling, passing data through many layers of components without explicit
props at each level.

A context API in a string-based renderer would need to be scoped per request to be safe in
concurrent environments. If two requests render simultaneously and both use async
components, a global context would be corrupted: one request's async resolution would read
the other request's context values.

The only way to scope context per request is to attach a request identifier (`rid`) to
every context read. But if every component that reads context must receive an `rid`, the
API offers no advantage over passing data as props directly.

An alternative is `AsyncLocalStorage`, which provides implicit per-request scoping without
explicit identifiers. However, ALS introduces measurable performance overhead on every
async boundary and adds a hidden dependency between components and their execution
context. This conflicts with the library's goal of minimal runtime cost.

The recommended approach is props and composition. Structure components so that data flows
explicitly through the tree. If deeply nested components need access to request-level
data, restructure the tree so the data is passed at a higher level rather than drilled
through intermediate components.

## Why JSX.Element includes Promise

The type `JSX.Element` is defined as `string | Promise<string>` because the presence of
async children is a runtime property of the component tree, not a static property of any
single component. A synchronous component becomes async if any of its descendants are
async. TypeScript cannot express this conditional relationship in the type system
([microsoft/TypeScript#14729](https://github.com/microsoft/TypeScript/issues/14729)).

Defining `JSX.Element` as just `string` would require every async component to be awaited
at the call site, breaking the seamless composition model. Defining it as just
`Promise<string>` would force unnecessary async overhead on fully synchronous trees. The
union type is the correct representation of the runtime behavior.
