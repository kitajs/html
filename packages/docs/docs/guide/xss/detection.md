---
description:
  How the editor plugin and xss-scan CLI analyze JSX child types to report XSS issues
  before production.
---

# How XSS Detection Works

Kita Html catches XSS vulnerabilities before they reach production through two tools that
share the same analysis engine: a TypeScript language service plugin for real-time editor
feedback, and a CLI scanner for CI/CD pipelines.

## Editor plugin

The TypeScript plugin hooks into `getSemanticDiagnostics`. When a `.tsx` or `.jsx` file is
analyzed, the plugin walks the JSX AST depth-first and inspects every expression used as a
child of an element. For each expression, it resolves the TypeScript type and determines
whether that type could carry unescaped HTML.

If the type is `string`, `any`, or an object with `toString()`, the expression is flagged
as unsafe. If the type is a number, boolean, string literal, `JSX.Element`, or
`Html.Children`, it is considered safe. Union types are safe only if every member is safe.
Both branches of ternary expressions are checked independently.

The plugin emits diagnostics directly in the editor with error codes TS88601 through
TS88604. These appear as red or yellow squiggles on the unsafe expression, with a message
explaining the issue and how to fix it.

## CLI scanner

The `xss-scan` CLI creates a TypeScript program from your `tsconfig.json`, loads all
project files, and runs the same analysis as the editor plugin. It outputs colored
diagnostics to the terminal and exits with code 0 (clean), 1 (errors found), or 2
(warnings only).

Adding `xss-scan` to your test script ensures that every CI run catches XSS issues that
may have been introduced since the last commit. The scanner analyzes the entire project in
a single pass, making it suitable for pre-commit hooks or CI gates.

## What this means in practice

The combination of editor-time and CI-time detection creates a closed loop. The editor
catches issues as you type. The CI scanner catches anything that slipped through, such as
changes from a developer without the plugin configured, or type changes in a dependency
that make a previously safe expression unsafe. The only way to ship XSS-vulnerable code is
to explicitly suppress the diagnostic using one of the documented suppression techniques.
