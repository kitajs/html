# OG Image Plugin Plan

## Goal

Create an Rspress plugin that generates Open Graph and Twitter social card images for each
documentation page at build time.

The plugin should:

- Generate one image per page from page metadata.
- Support multiple reusable image templates.
- Let each page choose a template through frontmatter.
- Inject the generated image URL into `og:image` and `twitter:image` metadata.
- Be generic enough that other projects can define their own templates and styling.

## Why this plugin exists

The docs already have enough information to generate good social cards:

- page title
- description
- route path
- frontmatter

Instead of hand-authoring images, the build can generate them automatically from a small
set of templates.

This also makes it possible to give different kinds of pages different looks:

- guide pages
- API pages
- comparison pages
- landing pages

## High-level design

The plugin has four responsibilities:

1. Collect page metadata.
2. Choose an OG template for each page.
3. Render an image file for that page.
4. Inject the image into page metadata.

## Rendering stack

Recommended stack:

- `satori` for rendering JSX-like layouts into SVG.
- `@resvg/resvg-js` for converting SVG into PNG.

Why this stack:

- Good fit for build-time generation.
- Template layout can be described in JSX.
- No browser dependency.
- Easier to make generic than screenshot-based approaches.

Alternatives considered:

- `playwright` screenshots of HTML pages
- `sharp` compositing text over image backgrounds
- `node-canvas`

These are viable, but `satori + resvg` is the cleanest starting point for reusable
template-based OG cards.

## Frontmatter API

Each page should be able to opt into a template with frontmatter:

```yaml
---
title: Async Components
description: Use async function components and understand promise propagation.
ogTemplate: guide
og:
  eyebrow: Async
  accent: '#ad4336'
---
```

Suggested frontmatter fields:

- `ogTemplate`: name of the template to use.
- `og`: optional object with template-specific overrides.

Suggested `og` keys:

- `title`: override the page title used for the card.
- `description`: override the page description used for the card.
- `eyebrow`: short label above the title.
- `accent`: color override.
- `image`: optional manual image URL. If present, generation may be skipped.

Resolution order:

1. `og.title` if present
2. page title

and

1. `og.description` if present
2. page description

## Plugin configuration API

Suggested public API:

```ts
type OgTemplateContext = {
  title: string
  description?: string
  pagePath: string
  frontmatter: Record<string, unknown>
  siteTitle?: string
  og?: Record<string, unknown>
}

type OgTemplate = {
  width?: number
  height?: number
  render: (ctx: OgTemplateContext) => React.ReactNode
}

type OgPluginOptions = {
  baseUrl: string
  outDir?: string
  defaultTemplate: string
  templates: Record<string, OgTemplate>
  fonts: Array<{
    name: string
    data: Buffer
    weight?: number
    style?: 'normal' | 'italic'
  }>
}
```

Notes:

- `baseUrl` is needed for absolute `og:image` URLs.
- `defaultTemplate` is used when a page does not specify `ogTemplate`.
- `templates` is the extensibility point.
- `fonts` are required because `satori` needs actual font data.

## Built-in template strategy

Start with a small built-in set:

- `default`
- `guide`
- `api`
- optional later: `comparison`

Each template should just be a function.

Example:

```ts
const templates = {
  default: {
    width: 1200,
    height: 630,
    render({ title, description }) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 64,
            background: 'linear-gradient(135deg, #111 0%, #2a1614 100%)',
            color: 'white'
          }}
        >
          <div style={{ fontSize: 24, opacity: 0.8 }}>Kita Html</div>
          <div>
            <div style={{ fontSize: 64, fontWeight: 700 }}>{title}</div>
            {description && (
              <div style={{ fontSize: 28, marginTop: 16, opacity: 0.85 }}>
                {description}
              </div>
            )}
          </div>
          <div style={{ fontSize: 22, opacity: 0.7 }}>html.kitajs.org</div>
        </div>
      )
    }
  }
}
```

This template model is the main thing that makes the plugin reusable across projects.

## Page discovery

The plugin needs to collect:

- source file path
- route path
- title
- description
- frontmatter

Practical first approach:

- Glob `docs/**/*.md` and `docs/**/*.mdx`
- Parse frontmatter with `gray-matter`
- Read the first heading if a title is not in frontmatter
- Derive route path from the file path

Why this is acceptable:

- It is build-time work only.
- It avoids deep coupling to internal page-data timing.
- It is easier to reason about than hooking deep into the markdown pipeline first.

## Route-to-image mapping

Generated files should have predictable paths.

Example:

```txt
docs/guide/async/using-suspense.md
-> /og/guide/async/using-suspense.png
```

Benefits:

- easy caching
- easy debugging
- no opaque IDs
- stable URLs unless page path changes

Suggested output layout:

```txt
dist/og/
  guide/
  api/
  integrations/
```

## Metadata injection

Each page should end up with:

```html
<meta property="og:image" content="https://site/og/...png" />
<meta name="twitter:image" content="https://site/og/...png" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta name="twitter:card" content="summary_large_image" />
```

Preferred implementation order:

1. Use a proper Rspress page-data or metadata hook if available.
2. If that is not enough, post-process generated HTML files after build.

The first option is cleaner. The second is a fallback.

## Build lifecycle

Suggested build flow:

1. Build starts.
2. Plugin scans docs files.
3. Plugin resolves per-page metadata.
4. Plugin selects a template for each page.
5. Plugin renders SVG with `satori`.
6. Plugin converts SVG to PNG with `resvg`.
7. Plugin writes images to output directory.
8. Plugin injects social meta tags into each page.

## Caching strategy

Not required for version 1, but useful later.

Possible cache key:

- file contents
- frontmatter
- selected template name
- template version/hash
- plugin version

Possible cache file:

```txt
.rspress/.og-cache.json
```

Version 1 can skip this and regenerate all images on every build.

## Dev mode

Version 1 can be build-only.

Later improvements:

- regenerate only the current page image during dev
- watch file changes
- expose a debug route or preview page for templates

Do not start here. Keep the first version simple.

## Edge cases and constraints

### Fonts

`satori` needs real font buffers. The plugin should accept configured fonts explicitly.

### Long titles

Need a strategy for overflow:

- max lines
- font size reduction
- clipping/ellipsis if necessary

### Missing descriptions

Templates should still look good with only a title.

### Emoji

Emoji rendering may be inconsistent unless explicitly supported by the font stack.

### Absolute URLs

Open Graph metadata should use absolute image URLs, so `baseUrl` must be required.

### Manual overrides

If `og.image` is set, the plugin should skip generation for that page and inject the
manual image URL.

## Suggested file layout

Create the plugin under:

```txt
packages/docs/plugins/og/
  index.ts
  generate.ts
  parsePages.ts
  injectMeta.ts
  templates.tsx
  types.ts
  PLAN.md
```

Suggested responsibilities:

- `index.ts`: Rspress plugin entry
- `generate.ts`: render SVG and PNG files
- `parsePages.ts`: discover docs pages and extract metadata
- `injectMeta.ts`: connect generated image URLs to page metadata
- `templates.tsx`: built-in templates
- `types.ts`: public and internal type definitions

## Minimal version 1 scope

Ship the smallest useful version first.

Version 1 should include:

- build-time generation only
- one built-in default template
- support for `ogTemplate`
- support for `og.title` and `og.description`
- PNG output generation
- `og:image` and `twitter:image` injection

Version 1 should not include yet:

- many templates
- cache invalidation logic
- live preview UI
- dev-only watch mode
- per-page custom JSX template files

## Phase plan

### Phase 1: Spike

- Install `satori` and `@resvg/resvg-js`
- Prove one page can become one PNG
- Validate fonts and output quality

### Phase 2: Metadata collection

- Parse docs pages
- Resolve title/description/route/frontmatter
- Decide route-to-image mapping

### Phase 3: Template selection

- Implement `defaultTemplate`
- Read `ogTemplate` from frontmatter
- Add `og` overrides

### Phase 4: Metadata injection

- Inject `og:image`
- Inject `twitter:image`
- Ensure URLs are absolute

### Phase 5: Cleanup

- Handle missing metadata cleanly
- Add error messages for missing templates
- Add snapshot or fixture tests for representative pages

## Recommendation

Build this as a generic plugin from the start, but only expose a small surface area.

The key design decision is that templates are just functions and page selection is driven
by frontmatter. If that stays simple, the plugin can remain generic without becoming
heavy.

The first version should focus on correctness and clean metadata injection. Fancy
templates and caching can come later.
