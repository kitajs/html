import type { Nitro, NitroModule } from 'nitro/types'
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

const VIRTUAL_PREFIX = '#kitajs/nitro-html/page/'

/** Builds a stable virtual module ID without exposing absolute source paths in imports. */
function virtualId(page: ScannedPage) {
  const hash = createHash('sha256').update(page.file).digest('hex').slice(0, 12)
  return `${VIRTUAL_PREFIX}${hash}`
}

/** Generates a lazy runtime wrapper that imports exactly one page module. */
function virtualSource(page: ScannedPage, autoDoctype: boolean) {
  return `import Page from ${JSON.stringify(page.file)}\nimport { createPageHandler } from "@kitajs/nitro-html-plugin/runtime"\nexport default createPageHandler(Page, ${JSON.stringify({ autoDoctype, renderer: page.renderer })})`
}

/** Returns whether an existing method can intercept a generated GET/HEAD page. */
function methodsConflict(existing?: string) {
  if (!existing) {
    return true
  }

  const method = existing.toUpperCase()
  return method === 'GET' || method === 'HEAD'
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
 * Rejects Nitro routes, handlers, and renderers that overlap generated pages.
 *
 * Handlers registered by this module are skipped so the check can run again in
 * `build:before`, after filesystem routes and later modules have registered theirs.
 */
function assertNoConflicts(
  nitro: Nitro,
  pages: Map<string, ScannedPage>,
  renderer: { page: ScannedPage; id: string } | undefined
) {
  const configuredRenderer = nitro.options.renderer

  if (
    renderer &&
    configuredRenderer &&
    (configuredRenderer.template || configuredRenderer.handler !== renderer.id)
  ) {
    throw new Error(
      `@kitajs/nitro-html-plugin: renderer page ${renderer.page.file} conflicts with the configured Nitro renderer.`
    )
  }

  const candidates: {
    route: string
    method?: string
    handler: string
    source: string
  }[] = []

  for (const [route, definition] of Object.entries(nitro.options.routes)) {
    candidates.push(
      typeof definition === 'string'
        ? { route, handler: definition, source: 'configured route' }
        : {
            route,
            handler: definition.handler,
            source: 'configured route',
            ...(definition.method && { method: definition.method })
          }
    )
  }

  for (const [handlers, source] of [
    [nitro.options.handlers, 'configured handler'],
    [nitro.scannedHandlers, 'scanned Nitro route']
  ] as const) {
    for (const handler of handlers) {
      if (!handler.middleware) {
        candidates.push({
          route: handler.route,
          handler: handler.handler,
          source,
          ...(handler.method && { method: handler.method })
        })
      }
    }
  }

  for (const candidate of candidates) {
    if (
      candidate.handler.startsWith(VIRTUAL_PREFIX) ||
      !methodsConflict(candidate.method)
    ) {
      continue
    }

    const page = pages.get(canonicalizeRoute(candidate.route))

    if (page) {
      throw new Error(
        `@kitajs/nitro-html-plugin: GET ${page.route} conflicts with ${candidate.source} ${candidate.route}:\n- ${page.file}\n- ${candidate.handler}`
      )
    }
  }
}

/**
 * Creates the Nitro v3 module that registers convention-based Kita pages.
 *
 * Each ordinary page becomes a lazy GET and HEAD route backed by its own virtual module.
 * One root catch-all page may become Nitro's renderer, which remains lower priority than
 * explicit API and route handlers.
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
      const autoDoctype = options.autoDoctype ?? true
      const rendererRef = renderer && { page: renderer, id: virtualId(renderer) }

      if (renderer) {
        conflictingRoutes.set('/**', renderer)

        // A renderer configured before this module runs must be rejected before ours
        // replaces it.
        if (nitro.options.renderer?.handler || nitro.options.renderer?.template) {
          throw new Error(
            `@kitajs/nitro-html-plugin: renderer page ${renderer.file} conflicts with the configured Nitro renderer.`
          )
        }
      }

      assertNoConflicts(nitro, conflictingRoutes, undefined)

      for (const page of pages) {
        const id = virtualId(page)
        nitro.options.virtual[id] = virtualSource(page, autoDoctype)

        // Nitro has one lowest-priority renderer. Registering the root catch-all as a
        // normal route as well would create two competing /** handlers.
        if (page.renderer) {
          nitro.options.renderer = { handler: id }
          continue
        }

        // Nitro's router does not fall back from HEAD to GET, so HEAD is registered
        // explicitly. Otherwise HEAD would reach the renderer or a 404 instead of the page.
        for (const method of ['GET', 'HEAD'] as const) {
          nitro.options.handlers.push({
            route: page.route,
            handler: id,
            lazy: true,
            method
          })
        }
      }

      nitro.hooks.hook('build:before', (instance) => {
        // Filesystem routes and modules installed after this one are only known now.
        assertNoConflicts(instance, conflictingRoutes, rendererRef)
      })
    }
  }
}
