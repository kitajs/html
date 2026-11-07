# @kitajs/html Documentation (New)

Official documentation site for @kitajs/html, built with
[Rspress 2.0](https://rspress.rs).

This is a fresh documentation setup with improved structure, visual design, and
organization.

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Features

- ⚡ **Lightning fast** with Rspress 2.0
- 🎨 **Custom interactive hero** with animated Doug turtle and VSCode mockup
- 🎯 **KitaJS brand colors** throughout (terracotta #bd695e, #ad4336, #e4c8c5)
- 📚 **Reorganized content** with better hierarchy
- 🔍 **TypeScript hover info** via Twoslash plugin
- 🗺️ **SEO-optimized** with sitemap generation
- 🌳 **File tree support** for showing project structure
- 🖼️ **Open Graph images** for social sharing
- 📦 **Zero runtime dependencies** (only @rspress/core)

## Project Structure

```
docs-new/
├── docs/
│   ├── public/                        # Static assets
│   │   ├── logo.png
│   │   ├── doug-pc-glasses.svg
│   │   └── xss-preview.png
│   ├── _nav.json                      # Top navigation
│   ├── index.md                       # Home page with hero
│   ├── guide/
│   │   ├── _meta.json
│   │   ├── introduction.md
│   │   ├── getting-started.md
│   │   ├── xss-protection/            # XSS security docs
│   │   │   ├── overview.md
│   │   │   ├── scanner.md
│   │   │   └── sanitization.md
│   │   └── features/                  # Feature docs
│   │       ├── jsx-syntax.md
│   │       ├── async-components.md
│   │       └── benchmark.md
│   ├── integrations/
│   │   ├── overview.md
│   │   ├── frameworks/
│   │   │   └── fastify.md
│   │   └── libraries/
│   │       ├── htmx.md
│   │       ├── alpine.md
│   │       ├── turbo.md
│   │       └── base-templates.md
│   └── api/                           # API reference
│       ├── index.md
│       ├── core.md
│       ├── jsx-runtime.md
│       └── plugins.md
├── theme/
│   ├── components/
│   │   ├── HeroInteractive.tsx        # Animated hero
│   │   └── HeroInteractive.module.css # Hero styles
│   ├── index.tsx                      # Theme customization
│   └── index.css                      # Brand colors
├── rspress.config.ts                  # Rspress configuration
├── package.json                       # Dependencies
└── tsconfig.json                      # TypeScript config
```

## Theme Customization

### Brand Colors (KitaJS)

```css
--rp-c-brand: #bd695e; /* Primary terracotta */
--rp-c-brand-dark: #ad4336; /* Dark terracotta */
--rp-c-brand-light: #e4c8c5; /* Light terracotta */
```

### Interactive Hero

The hero section features:

- Floating Doug turtle logo with gentle animation
- Mock VSCode editor showing KitaJS code example
- Glowing effects with brand colors
- Smooth animations (float, breathe, shimmer)
- Fully responsive (hides mockup on mobile)

## Plugins

- **@rspress/plugin-twoslash** - TypeScript hover info in code blocks
- **@rspress/plugin-sitemap** - SEO sitemap generation
- **rspress-plugin-file-tree** - File tree visualizations
- **rspress-plugin-og** - Open Graph image generation
- **rsbuild-plugin-open-graph** - OG meta tags

## Configuration

The site can be configured via environment variables:

```bash
# Override hostname (default: html.kitajs.org)
DOCS_HOSTNAME=docs.example.com pnpm build
```

## Build Output

- **Total size**: ~1.4 MB web assets (267 KB gzipped)
- **20 HTML pages** generated
- **Full-text search index** included
- **Clean URLs** enabled (no .html extensions)

## Improvements Over Old Docs

1. **Better organization** - Logical content hierarchy with sections
2. **Interactive hero** - Engaging homepage with animations
3. **Enhanced navigation** - Clear sidebar with sections and dividers
4. **Brand consistency** - KitaJS colors applied throughout
5. **TypeScript integration** - Hover info for better learning
6. **SEO optimized** - Sitemap, OG tags, meta descriptions
7. **Production-ready** - Following rspress best practices

## Next Steps

- Test the site at http://localhost:3000
- Review all pages for correctness
- Add more API documentation as needed
- Consider adding more examples
- Deploy to production at html.kitajs.org

## Deployment

The built site in `dist/` is being deployed to GitHub Pages via the `gh-pages` branch. The
deployment workflow is configured in `.github/workflows/ci.yml` and runs on every push to
`main`.

## Resources

- [Rspress Documentation](https://rspress.rs)
- [@kitajs/html Repository](https://github.com/kitajs/html)
- [KitaJS Website](https://kitajs.org)
