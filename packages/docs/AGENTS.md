# @kitajs/docs-html - Developer Guide

## Overview

The documentation site for Kita Html, built with [Rspress](https://rspress.dev/) and
deployed at https://html.kitajs.org. All project documentation lives here; the per-package
READMEs are being deprecated in favor of this centralized site.

## Architecture

### Framework

Rspress (React-based static site generator, similar to VitePress). Configuration is in
`rspress.config.ts`. The site uses a custom theme at `theme/` with brand colors and an
interactive hero component.

### Directory Structure

```
docs/
  index.md                    Homepage
  _nav.json                   Top navigation
  guide/                      Learning-oriented content
    _meta.json                Sidebar ordering
    introduction.md
    getting-started.md
    how-jsx-becomes-html.md
    xss/                      XSS protection (solution-first ordering)
    async/                    Async components and Suspense
    jsx/                      JSX syntax and type extensions
    design-decisions.md
    reference/                Benchmarks, compatibility, migration
  integrations/               Framework and library integrations
    frameworks/               Fastify, Elysia
    type-extensions/          HTMX, Alpine.js, Hotwire Turbo
  api/                        Handwritten XSS tooling docs
    generated/                Auto-generated from source via TypeDoc
theme/
  index.tsx                   Custom layout
  index.css                   Brand styling
  components/                 Hero interactive component
```

### Navigation

Sidebar ordering is controlled by `_meta.json` files in each directory. Top navigation is
in `docs/_nav.json`. Three main sections: Guide, Integrations, API.

## Information Mapping Methodology

All documentation follows the Information Mapping (Structured Writing) methodology by
Robert Horn. Each page is assigned exactly one information type, and types are never mixed
within a page.

| Type      | Purpose                                | When to use                                |
| --------- | -------------------------------------- | ------------------------------------------ |
| Concept   | What something is and why it matters   | Explaining ideas, architecture, trade-offs |
| Procedure | Step-by-step instructions              | Setup guides, how-to pages                 |
| Process   | How something works internally         | Data flow, internal mechanisms             |
| Principle | Rules, design decisions, rationale     | Safety rules, architectural decisions      |
| Structure | API references, component organization | Function signatures, type definitions      |
| Fact      | Data, measurements, specifications     | Benchmarks, compatibility tables           |

### Core Principles

- **Chunking**: One topic per page, 200-800 words
- **Relevance**: No tangential content on any page
- **Labelling**: Concrete, descriptive page titles
- **No type mixing**: Procedures never explain internals; concepts never list steps;
  structure pages never contain rationale

### Section Ordering Decisions

- **XSS section**: Solution-first. The safe attribute and detection tooling come before
  the "why not auto-escape" explanation. Readers who only skim the first page walk away
  knowing how to write safe code.
- **API section**: XSS tooling is documented by capability (analysis engine, editor
  plugin, CLI scanner) rather than by package name. This anticipates the upcoming split of
  `@kitajs/ts-html-plugin` into three packages.

## Writing Style

- Professional and technical. Direct, concise, information-dense.
- No filler, no motivational language, no repetition, no emojis.
- Maximum 2-4 headings per page.
- Prefer short paragraphs over bullet lists (max 5 bullets per page).
- Under 800 words per page unless complexity requires more.
- Only essential code blocks.
- No decorative separators or horizontal rules.
- No em dashes. Use periods, commas, or rephrase.
- Do not use "Overview", "Introduction", or "Conclusion" as section headings unless
  necessary.

## Development

```bash
pnpm -F @kitajs/docs-html dev       # Dev server on port 1229
pnpm -F @kitajs/docs-html build     # Production build
pnpm -F @kitajs/docs-html preview   # Preview production build
```

## Adding Pages

1. Create the `.md` file in the appropriate directory
2. Add the filename (without extension) to the directory's `_meta.json`
3. Assign the page an information type and do not mix types
4. Follow the writing style rules above
5. Run `pnpm format` and `pnpm -F @kitajs/docs-html build` to verify

## Auto-generated API Docs

Two TypeDoc instances generate API docs on each build, one per package:

- `api/html/` from `@kitajs/html` source (`packages/html/src/`)
- `api/fastify/` from `@kitajs/fastify-html-plugin` source
  (`packages/fastify-html-plugin/src/`)

These `.md` files are gitignored. Do not edit them manually. To improve the generated
output, update the JSDoc comments in the source files. Mark internal helpers with
`@internal` to exclude them. TypeDoc warnings in the build output indicate JSDoc issues
that should be fixed in the source.

Rspress rejects duplicate plugin names, so the `namedTypeDoc` wrapper in
`rspress.config.ts` renames each instance. The `typedoc.json` file points TypeDoc to
`tsconfig.typedoc.json` which uses `paths` to redirect `@kitajs/html` imports to source
files, avoiding duplicate `JSX.Element` conflicts between `src/jsx.ts` and
`dist/jsx.d.ts`.

Each generated directory has a `_meta.json` that controls sidebar ordering. TypeDoc only
generates this file once (if missing), so edits persist. Remove the `"index"` entry from
these files to hide the module-list landing pages from the sidebar.

XSS tooling is documented in the guide under `docs/guide/xss/`. Update those pages when
`@kitajs/ts-html-plugin` changes.

## Sidebar Structure

Sidebar ordering uses `_meta.json` files. Two entry types for directories:

- `dir-section-header`: Renders the directory as a section header. Use for directories
  that should appear as top-level groups (no duplication).
- `section-header` + loose files: Use when grouping files that are not in a subdirectory.

Do not combine `section-header` with a `dir` of the same label. This creates duplicate
entries. Use `dir-section-header` instead.

## Key Files

- `rspress.config.ts` - Site configuration, TypeDoc instances, plugins
- `typedoc.json` - Points TypeDoc to the custom tsconfig
- `tsconfig.typedoc.json` - Compilation config for TypeDoc (paths override for JSX
  conflict)
- `theme/env.d.ts` - Type declarations for SCSS, SVG, CSS imports
- `docs/_nav.json` - Top navigation bar
- `docs/guide/_meta.json` - Guide sidebar ordering
- `theme/index.tsx` - Custom layout with package manager tabs
- `theme/index.css` - Brand colors (#bd695e, #ad4336, #e4c8c5)
- `theme/components/HeroInteractive.tsx` - VSCode mockup hero component
