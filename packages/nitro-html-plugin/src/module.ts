import type { NitroEventHandler, NitroModule } from 'nitro/types'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { scanPages } from './scan.js'
import type { ScannedPage } from './types.js'

/** Options for the `@kitajs/nitro-html-plugin` Nitro module. */
export interface NitroKitaHtmlOptions {
  /**
   * Directory containing convention pages. Relative paths resolve from Nitro's root.
   *
   * @default `<serverDir>/pages`
   */
  pagesDir?: string

  /**
   * Whether HTML roots automatically receive `<!doctype html>`.
   *
   * @default true
   */
  autoDoctype?: boolean

  /** Additional glob patterns ignored relative to `pagesDir`. */
  ignore?: string[]
}

/** Builds a stable virtual module ID without exposing absolute source paths in imports. */
function virtualId(page: ScannedPage) {
  const hash = createHash('sha256').update(page.file).digest('hex').slice(0, 12)
  return `#kitajs/nitro-html/page/${hash}`
}

/** Generates a lazy runtime wrapper that imports exactly one page module. */
function virtualSource(page: ScannedPage, autoDoctype: boolean) {
  return `import Page from ${JSON.stringify(page.file)}\nimport { createPageHandler } from "@kitajs/nitro-html-plugin/runtime"\nexport default createPageHandler(Page, ${JSON.stringify({ autoDoctype, renderer: page.renderer })})`
}

/** Returns whether an existing method can intercept a generated GET page. */
function methodsConflict(existing?: string) {
  return !existing || existing.toLowerCase() === 'get'
}

/** Rejects configured or scanned Nitro handlers that overlap generated page routes. */
function assertHandlerConflicts(
  pages: Map<string, ScannedPage>,
  handlers: NitroEventHandler[],
  source: string
) {
  for (const handler of handlers) {
    if (handler.middleware || !methodsConflict(handler.method)) continue
    const page = pages.get(canonicalizeRoute(handler.route))
    if (page) {
      throw new Error(
        `@kitajs/nitro-html-plugin: GET ${page.route} conflicts with ${source}:\n- ${page.file}\n- ${handler.handler}`
      )
    }
  }
}

/** Removes parameter names so semantically identical dynamic patterns compare equally. */
function canonicalizeRoute(route: string) {
  return (
    route
      .replace(/\*\*:[\w-]+/g, '**')
      .replace(/:[\w-]+/g, ':')
      .replace(/\/$/, '') || '/'
  )
}

/**
 * Creates the Nitro v3 module that registers convention-based Kita pages.
 *
 * Each ordinary page becomes a lazy GET route backed by its own virtual module. One root
 * catch-all page may become Nitro's renderer, which remains lower priority than explicit
 * API and route handlers.
 *
 * @example
 *
 * ```ts
 * import { defineConfig } from 'nitro'
 * import { nitroKitaHtml } from '@kitajs/nitro-html-plugin'
 *
 * export default defineConfig({
 *   serverDir: './server',
 *   modules: [nitroKitaHtml()]
 * })
 * ```
 *
 * @param options Page scanning and rendering options.
 * @returns A Nitro v3 build-time module.
 */
export function nitroKitaHtml(options: NitroKitaHtmlOptions = {}): NitroModule {
  return {
    name: '@kitajs/nitro-html-plugin',
    async setup(nitro) {
      const pagesDir = path.resolve(
        nitro.options.rootDir,
        options.pagesDir ??
          path.join(
            nitro.options.serverDir
              ? path.relative(nitro.options.rootDir, nitro.options.serverDir)
              : 'server',
            'pages'
          )
      )

      if (!existsSync(pagesDir)) {
        if (options.pagesDir) {
          throw new Error(
            `@kitajs/nitro-html-plugin: pages directory not found: ${pagesDir}`
          )
        }
        nitro.logger.warn(`No Kita pages directory found at ${pagesDir}.`)
        return
      }

      const { pages, routes, renderer } = await scanPages(pagesDir, options.ignore)
      const conflictingRoutes = new Map(routes)
      if (renderer) {
        conflictingRoutes.set('/**', renderer)
      }
      const autoDoctype = options.autoDoctype ?? true

      if (
        renderer &&
        (nitro.options.renderer?.handler || nitro.options.renderer?.template)
      ) {
        throw new Error(
          `@kitajs/nitro-html-plugin: renderer page ${renderer.file} conflicts with the configured Nitro renderer.`
        )
      }

      for (const [route, definition] of Object.entries(nitro.options.routes)) {
        const method = typeof definition === 'string' ? undefined : definition.method
        if (!methodsConflict(method)) continue
        const page = conflictingRoutes.get(canonicalizeRoute(route))
        if (page) {
          throw new Error(
            `@kitajs/nitro-html-plugin: GET ${page.route} conflicts with configured route ${route}:\n- ${page.file}`
          )
        }
      }
      assertHandlerConflicts(
        conflictingRoutes,
        nitro.options.handlers,
        'configured handler'
      )

      for (const page of pages) {
        const id = virtualId(page)
        nitro.options.virtual[id] = virtualSource(page, autoDoctype)

        // Nitro has one lowest-priority renderer. Registering the root catch-all as a
        // normal route as well would create two competing /** handlers.
        if (page.renderer) {
          nitro.options.renderer = { handler: id }
        } else {
          nitro.options.routes[page.route] = { handler: id, lazy: true, method: 'GET' }
        }
      }

      nitro.hooks.hook('build:before', (instance) => {
        // Modules install before Nitro scans filesystem routes, so collision checking is
        // repeated once those handlers are available.
        assertHandlerConflicts(
          conflictingRoutes,
          instance.scannedHandlers,
          'scanned Nitro route'
        )
      })
    }
  }
}
