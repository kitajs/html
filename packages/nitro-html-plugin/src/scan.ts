import { glob } from 'tinyglobby'
import { pagePathToRoute } from './routes.js'
import type { ScannedPage } from './types.js'

const DEFAULT_IGNORES = [
  '**/*.d.ts',
  '**/*.test.{tsx,jsx}',
  '**/*.spec.{tsx,jsx}',
  '**/_*/**',
  '**/_*.{tsx,jsx}'
]

/**
 * Scans and validates Kita page files.
 *
 * Results are sorted by normalized relative path to keep route registration and error
 * output deterministic across platforms. Files that resolve to the same canonical route
 * fail before Nitro's router can apply insertion-order precedence.
 *
 * @param pagesDir Absolute pages directory.
 * @param ignore Additional glob patterns relative to `pagesDir`.
 * @returns Ordinary pages keyed by canonical route and an optional root renderer page.
 */
export async function scanPages(pagesDir: string, ignore: string[] = []) {
  const files = await glob('**/*.{tsx,jsx}', {
    cwd: pagesDir,
    absolute: true,
    dot: true,
    ignore: [...DEFAULT_IGNORES, ...ignore]
  })
  const pages: ScannedPage[] = files
    .map((file) => {
      const relativePath = file.slice(pagesDir.length + 1).replaceAll('\\', '/')
      return { file, ...pagePathToRoute(relativePath) }
    })
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
  const routes = new Map<string, ScannedPage>()
  let renderer: ScannedPage | undefined

  for (const page of pages) {
    if (page.renderer) {
      if (renderer) {
        throw new Error(
          `@kitajs/nitro-html-plugin: multiple renderer pages found:\n- ${renderer.file}\n- ${page.file}`
        )
      }
      renderer = page
      continue
    }

    const existing = routes.get(page.canonicalRoute)
    if (existing) {
      throw new Error(
        `@kitajs/nitro-html-plugin: multiple pages resolve to GET ${page.canonicalRoute}:\n- ${existing.file}\n- ${page.file}`
      )
    }
    routes.set(page.canonicalRoute, page)
  }

  return { pages, routes, renderer }
}
