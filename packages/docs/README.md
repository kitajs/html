# @kitajs/html Documentation

Official documentation site for @kitajs/html, built with
[Rspress 2.0](https://rspress.rs).

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

## Project Structure

```
docs/
├── public/               # Static assets (logo, images, etc.)
├── guide/                # Getting started and core guides
│   ├── getting-started.md
│   ├── xss-scanner.md
│   ├── sanitization.md
│   ├── jsx-syntax.md
│   ├── async-components.md
│   └── benchmark.md
├── integrations/         # Integration guides
│   ├── overview.md
│   ├── fastify.md
│   ├── htmx.md
│   ├── alpine.md
│   ├── turbo.md
│   └── base-templates.md
├── _nav.json            # Top-level navigation
├── index.md             # Home page
└── hello.md             # Example page (can be deleted)

theme/
├── index.tsx            # Theme customization entry point
└── index.css            # Custom CSS with KitaJS branding
```

## Theme Customization

The documentation uses KitaJS brand colors:

- Primary: `#bd695e`
- Dark: `#ad4336`
- Light: `#e4c8c5`

These colors are defined in `theme/index.css` and applied throughout the site.

## Navigation

Navigation is configured in two ways:

1. **Top-level navigation**: Defined in `docs/_nav.json`
2. **Sidebar navigation**: Defined in `docs/[section]/_meta.json` files

## Adding New Pages

1. Create a new `.md` file in the appropriate directory
2. Add an entry to the corresponding `_meta.json` file
3. Use frontmatter for page configuration if needed

Example:

```md
---
title: My Page
description: A description of my page
---

# My Page Content

Content goes here...
```

## Features

- ⚡ Fast development with Rspress 2.0
- 🎨 Custom KitaJS branding and theme
- 🔍 Built-in full-text search
- 📱 Responsive design
- 🌙 Dark mode support
- 🎯 Type-safe MDX content
- 🚀 Static site generation
- 💨 Hot module replacement

## Deployment

Build the site for production:

```bash
pnpm build
```

The output will be in `doc_build/` directory, ready to be deployed to any static hosting
service.

## Resources

- [Rspress Documentation](https://rspress.rs)
- [@kitajs/html Repository](https://github.com/kitajs/html)
- [KitaJS Website](https://kitajs.org)
