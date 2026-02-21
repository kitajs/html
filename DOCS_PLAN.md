# Kita Html Documentation Plan

## Context

The current documentation lives scattered across three README files (one per package) and
a mockup docs site at `packages/docs/`. The goal is to consolidate all documentation into
a single Rspress-powered site at `packages/docs/`, structured following the Information
Mapping (Structured Writing) methodology, and eventually deprecate the READMEs.

The documentation must serve developers evaluating and adopting Kita Html: a JSX runtime
that produces HTML strings for server-side rendering, static sites, and HTMX applications.
The writing follows the author's requested narrative arc: explain why string-based JSX is
fast, then the XSS trade-off this creates, then the three-layer solution.

## Information Mapping Methodology

Each page is assigned exactly one of the six information types. Types are never mixed
within a page.

| Type      | Purpose                                | Example in this project                       |
| --------- | -------------------------------------- | --------------------------------------------- |
| Concept   | What something is and why it matters   | "What is Kita Html", "Async Components"       |
| Procedure | Step-by-step instructions              | "Getting Started", "Using Suspense"           |
| Process   | How something works internally         | "How JSX Becomes HTML", "Streaming Internals" |
| Principle | Rules, design decisions, rationale     | "XSS Safety Rules", "Design Decisions"        |
| Structure | API references, component organization | All API pages                                 |
| Fact      | Data, measurements, specifications     | "Benchmarks", "Serialization Table"           |

Core principles applied: chunking (one topic per page, 200-800 words), relevance (no
tangential content), labelling (concrete descriptive titles), consistency (same format
within each type), no type mixing (procedures never explain internals; concepts never list
steps).

## Decisions

- **Consolidation**: Very small pages (under 300 words) are merged into parent topics.
  Conditional Classes, the tag Tag, and Serialization fold into the JSX Syntax page.
  Formatting Output and Legacy JSX Transform fold into "Additional Configuration". Page
  count: 33.
- **Reference placement**: Reference pages live at the bottom of the Guide sidebar. Top
  nav stays at 3 items + GitHub.
- **Implementation**: Write the Introduction page first as a sample for tone/depth review
  before proceeding with all remaining pages.
- **XSS section ordering**: Lead with the solution (safe attribute, detection tooling),
  not the problem. The trade-off explanation ("why it works this way") comes after the
  reader already knows how to stay safe. This prevents the reader from hitting "XSS is
  possible" and bouncing before seeing that the tooling catches everything.
- **Integrations split**: Frameworks (Fastify, with room for future additions) and Type
  Extensions (HTMX, Alpine.js, Hotwire Turbo) as separate subsections.
- **ts-html-plugin docs**: Document by capability (XSS analysis rules, editor integration,
  CLI scanner) rather than by package name. This way, the upcoming split into three
  packages (base analysis, LSP plugin, CLI) won't require restructuring the docs -- just
  updating import paths and package names.

## Page Tree

```
docs/
  index.md                              Homepage (landing page)

  guide/
    introduction.md                     Concept    ~650 words
    getting-started.md                  Procedure  ~500 words
    how-jsx-becomes-html.md             Process    ~450 words

    xss/
      safe-attribute.md                 Procedure  ~550 words
      detection.md                      Process    ~500 words
      scanner-cli.md                    Procedure  ~400 words
      safety-rules.md                   Principle  ~400 words
      error-codes.md                    Structure  ~500 words
      why-not-auto-escape.md            Concept    ~500 words

    async/
      async-components.md               Concept    ~500 words
      suspense.md                       Concept    ~500 words
      using-suspense.md                 Procedure  ~500 words
      error-boundaries.md              Procedure  ~450 words
      streaming-internals.md            Process    ~450 words

    jsx/
      syntax.md                         Procedure  ~700 words
                                        (includes conditional classes,
                                         the tag tag, and serialization table)
      extending-types.md               Procedure  ~400 words

    design-decisions.md                 Principle  ~600 words

    reference/
      benchmarks.md                     Fact       ~500 words
      compatibility.md                  Fact       ~300 words
      migrating-from-html.md            Procedure  ~300 words
      additional-config.md              Procedure  ~350 words

  integrations/
    overview.md                         Concept    ~300 words

    frameworks/
      fastify.md                        Procedure  ~600 words

    type-extensions/
      htmx.md                           Procedure  ~350 words
      alpine.md                         Procedure  ~350 words
      hotwire-turbo.md                  Procedure  ~350 words

    base-templates.md                   Procedure  ~400 words

  api/
    index.md                            Structure  ~200 words
    core.md                             Structure  ~700 words
    jsx-runtime.md                      Structure  ~400 words
    suspense.md                         Structure  ~500 words
    error-boundary.md                   Structure  ~250 words
    xss-analysis.md                     Structure  ~350 words
    editor-plugin.md                    Structure  ~250 words
    scanner-cli.md                      Structure  ~250 words
    types.md                            Structure  ~400 words
```

Total: 34 pages, ~14,000 words estimated.

## Navigation Structure

Top navigation (3 items + external):

1. Guide -> `/guide/introduction`
2. Integrations -> `/integrations/overview`
3. API -> `/api/`
4. GitHub -> `https://github.com/kitajs/html` (external)

Sidebar for Guide:

```
Introduction
Getting Started
How JSX Becomes HTML
---
XSS Protection
  Using the Safe Attribute          <- solution first
  How XSS Detection Works           <- then how tooling catches it
  Running the XSS Scanner           <- practical CLI usage
  Safety Rules                       <- reference: what's safe/unsafe
  Error Codes                        <- reference: K601-K604
  Why Not Auto-Escape               <- deeper rationale, last
---
Async & Streaming
  Async Components
  Suspense Streaming
  Using Suspense
  Error Boundaries
  Streaming Internals
---
JSX
  Syntax
  Extending Types
---
Design Decisions
---
Reference
  Benchmarks
  Compatibility
  Migrating from HTML
  Additional Configuration
```

Sidebar for Integrations:

```
Overview
---
Frameworks
  Fastify
---
Type Extensions
  HTMX
  Alpine.js
  Hotwire Turbo
---
Base Templates
```

Sidebar for API:

```
Overview
@kitajs/html
@kitajs/html/jsx-runtime
@kitajs/html/suspense
@kitajs/html/error-boundary
---
XSS Analysis                    <- capability-based, not package-based
Editor Plugin                   <- easy to update when packages split
CLI Scanner                     <- easy to update when packages split
---
Type Definitions
```

## Page Specifications

### Guide

**Introduction** (Concept) Title: "What is Kita Html" Defines Kita Html as a JSX runtime
producing HTML strings. Explains WHY string concatenation is faster than virtual DOM (no
intermediate object graph, no diffing). Introduces the XSS trade-off briefly, then
immediately explains the three-layer solution (safe attribute, TS plugin, xss-scan CLI) so
the reader lands on "this is solved." Closes with positioning: SSR, static sites, HTMX,
email templates.

**Getting Started** (Procedure) Four steps: install packages, configure tsconfig.json
(jsx, jsxImportSource, plugins), configure editor workspace TypeScript, add xss-scan to
test script. Ends with verification: paste XSS-prone code, confirm editor error.

**How JSX Becomes HTML** (Process) Traces the data flow: TSX source -> TypeScript compiler
rewrites to jsx()/jsxs() calls -> runtime calls attributesToString/contentsToString ->
output is string or Promise. One three-stage code transformation example.

### XSS Protection

Section is ordered solution-first. A developer reading only the first page or two walks
away knowing how to write safe code. The "why" comes last for those who want deeper
understanding.

**Using the Safe Attribute** (Procedure) Adding `safe` to native elements, using
`Html.escapeHtml()` for components, using `e` template literal, `safe`-prefix variable
convention, `as 'safe'` cast. One example per technique. Guidance on placement (lowest
element in tree).

**How XSS Detection Works** (Process) Three-layer mechanism: TS plugin hooks into language
service, walks JSX AST, emits diagnostics for unsafe types. CLI creates a TS program, runs
same analysis. Runtime `safe` attribute triggers `escapeHtml`. Emphasizes: the tooling
catches all unsafe usage at dev time and CI -- you cannot accidentally ship XSS.

**Running the XSS Scanner** (Procedure) CLI options (--cwd, --project, --simplified), exit
codes (0/1/2), package.json integration, CI/CD example.

**Safety Rules** (Principle) Safe types: number, boolean, bigint, null, undefined, string
literals, JSX.Element, Html.Children, safe-prefixed vars, escapeHtml() returns. Unsafe:
string, any, objects with toString(). Script tags exempt. Both ternary branches checked.

**Error Codes** (Structure) Reference table: K601 (unsafe expression), K602 (double
escaping), K603 (component children XSS), K604 (unnecessary safe). Each with severity,
trigger condition, wrong/correct code.

**Why Not Auto-Escape** (Concept) Deeper explanation for those who want to understand the
trade-off. Why a string-based runtime cannot auto-escape children. Compares with React
(object elements allow auto-escaping). By this point, the reader already knows the
solution, so this reads as "here's the interesting engineering reason" rather than "here's
a scary problem."

### Async & Streaming

**Async Components** (Concept) Functions returning Promise<string>. Promise propagation:
any async child makes the tree async. JSX.Element as string | Promise<string>. When to
await vs cast.

**Suspense Streaming** (Concept) The problem (waiting for entire async tree). The solution
(stream fallback immediately, replace when ready). Request IDs for concurrent safety. What
happens without renderToStream.

**Using Suspense** (Procedure) Import, wrap async components with rid/fallback/catch, call
renderToStream, pipe stream to response. Callback and direct rid patterns. Async
fallbacks.

**Error Boundaries** (Procedure) Import ErrorBoundary, wrap async components, provide
catch handler. Interaction with Suspense catch. Sync errors need try/catch. Combined
pattern.

**Streaming Internals** (Process) Fallback wrapped in `<div data-sf>`, async resolution
produces `<template data-sr>` + `<script data-ss>`, client-side $KITA_RC replaces
fallback. HTTP chunked transfer.

### JSX

**Syntax** (Procedure) Fragments, boolean attributes, void elements, class/style
attributes, event handlers as strings. Links to HTML spec. Includes: conditional class
arrays with boolean short-circuit filtering (comparison with clsx), the `<tag of="name">`
element for runtime tag selection, and the serialization table (how each JS type renders
as a child).

**Extending Types** (Procedure) Declare global JSX namespace, extend IntrinsicElements,
extend HtmlTag. The all-types.d.ts escape hatch.

### Design Decisions (Principle)

Why no context API (string output, no lifecycle, rid requirement, ALS overhead). Why
JSX.Element includes Promise.

### Integrations

**Overview** (Concept) Kita Html works with any string-accepting framework. Official
Fastify plugin, type extension packages for HTMX/Alpine/Turbo. Express, Hono, Bun,
AdonisJS work without integration. HTML-to-JSX migration tool.

**Frameworks / Fastify** (Procedure) Install, register plugin, reply.html() with
sync/async/Suspense. autoDoctype config, kAutoDoctype per-request. Fastify 4.x/5.x.

**Type Extensions / HTMX** (Procedure) Enable type definitions (triple-slash or tsconfig).
Example with common attributes.

**Type Extensions / Alpine.js** (Procedure) Enable type definitions. Example with core
directives. Combining with HTMX.

**Type Extensions / Hotwire Turbo** (Procedure) Enable type definitions. turbo-frame and
turbo-stream elements.

**Base Templates** (Procedure) Layout component with doctype. Slot props pattern. Fastify
autoDoctype alternative.

### API (all Structure type)

Documented by capability rather than by current package boundaries. This means the
upcoming ts-html-plugin split into three packages (base analysis lib, LSP plugin, CLI)
only requires updating import paths and package names in these pages, not restructuring
the docs.

**Overview**: Index of all exported modules and primary exports. **@kitajs/html**:
escapeHtml, escape/e, contentsToString, attributesToString, createElement, Fragment,
isVoidElement, toKebabCase, styleToString. Signature, params, return type, minimal example
per function. **@kitajs/html/jsx-runtime**: jsx, jsxs, Fragment. jsx vs jsxs distinction.
**@kitajs/html/suspense**: Suspense component, renderToStream, resolveHtmlStream,
SuspenseScript, RequestData, SUSPENSE_ROOT. **@kitajs/html/error-boundary**: ErrorBoundary
component, HtmlTimeout class. **XSS Analysis**: The detection algorithm, type safety
rules, isSafeAttribute logic, diagnoseJsxElement/diagnoseExpression functions. Documented
as the analysis engine regardless of whether it's invoked from the editor or CLI.
(Currently in @kitajs/ts-html-plugin/src/util.ts, will move to the shared base package.)
**Editor Plugin**: TypeScript Language Service Plugin configuration, how it hooks into
getSemanticDiagnostics, supported editors, tsconfig.json plugin entry. (Currently
@kitajs/ts-html-plugin/src/index.ts, will become its own package.) **CLI Scanner**:
xss-scan command reference, flags, exit codes, programmatic API if any. (Currently
@kitajs/ts-html-plugin/src/cli.ts, will become its own package.) **Type Definitions**:
JSX.Element, IntrinsicElements, HtmlTag, PropsWithChildren, Children, Component. Extension
d.ts files (htmx, alpine, hotwire-turbo, all-types).

### Reference

**Benchmarks** (Fact): Performance data, methodology, hardware specs, comparison table.
**Compatibility** (Fact): Node.js, Bun, Deno, TypeScript, tsgo, Fastify versions, module
systems, editors. **Migrating from HTML** (Procedure): HTML-to-JSX tool, conversion
patterns, class stays as class (not className). **Additional Configuration** (Procedure):
Pretty-printing HTML output with html-prettify. Legacy JSX transform using `jsx: "react"`
with jsxFactory/jsxFragmentFactory (trade-offs: manual import, slight performance
penalty).

## Implementation Approach

Phase 1 (sample):

1. Write the Introduction page (`guide/introduction.md`) as a tone/depth sample
2. Run `pnpm --filter @kitajs/docs-html build` to verify it compiles
3. Submit for author review and iterate on style

Phase 2 (full build, after tone approval):

1. Delete all existing mockup docs under `packages/docs/docs/` (except index.md homepage)
2. Create the new directory structure with `_meta.json` files for sidebar ordering
3. Write pages in batches (by section). After each batch:
   - Run `pnpm --filter @kitajs/docs-html build` to verify compilation
   - Fix any broken links or build errors before proceeding
4. Writing order: Getting Started -> How JSX Becomes HTML -> XSS section -> Async section
   -> JSX section -> Design Decisions -> Integrations -> API -> Reference
5. Update `_nav.json` for the new top navigation
6. Update `rspress.config.ts` if sidebar config lives there rather than in `_meta.json`
   files
7. Keep the existing theme (index.tsx, HeroInteractive.tsx, index.css) unchanged
8. Update the homepage (index.md) to link to new routes
9. Final `pnpm --filter @kitajs/docs-html build` to confirm the complete site compiles
   cleanly

## Verification

1. Run `pnpm --filter @kitajs/docs-html build` -- must exit 0 with no errors
2. Verify all internal links resolve (build will catch broken links)
3. Verify code examples are syntactically correct
4. Verify the sidebar ordering matches the plan
5. Check page word counts stay within targets
6. Ensure no Information Map type mixing (no procedures in concept pages, etc.)
