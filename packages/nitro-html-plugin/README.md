# Nitro Kita Html Plugin

`@kitajs/nitro-html-plugin` adds convention-based Kita JSX pages to Nitro v3. Files under
`server/pages` become lazy Nitro routes, while one root catch-all page can become Nitro's
renderer.

```bash
pnpm add @kitajs/html @kitajs/nitro-html-plugin nitro
```

```ts
import { defineConfig } from 'nitro'
import { nitroKitaHtml } from '@kitajs/nitro-html-plugin'

export default defineConfig({
  serverDir: './server',
  modules: [nitroKitaHtml()]
})
```

See the [Nitro integration guide](https://html.kitajs.org/integrations/frameworks/nitro)
for page conventions, dynamic routes, renderers, and Suspense.

This package targets Nitro v3 and Node-compatible runtime presets.

Restart `nitro dev` after adding or deleting a page file. Changes to existing page files
continue to rebuild normally.
