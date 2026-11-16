import { runWithAutoSuspense } from '@kitajs/html/suspense'
import { definePlugin, type H3Event } from 'h3'
import { getKitaContext } from './context.js'
import { renderHtml } from './html.js'
import { kAutoDoctype } from './utils.js'

/** Options for the `@kitajs/h3-html-plugin` H3 plugin. */
export interface H3KitaHtmlOptions {
  /**
   * Whether HTML roots automatically receive `<!doctype html>`.
   *
   * @default true
   */
  autoDoctype?: boolean

  /**
   * Whether `AutoSuspense` receives the current request ID.
   *
   * The plugin enters the automatic Suspense scope before downstream middleware and route
   * handlers run, so the ID remains available across asynchronous operations.
   *
   * @default false
   */
  autoSuspense?: boolean

  /**
   * Generates the stable request ID used by Suspense.
   *
   * Values are embedded in HTML marker attributes and an inline script argument. Return a
   * compact trusted string or number rather than unsanitized request input.
   */
  genRequestId?: (event: H3Event) => string | number
}

/**
 * Installs `event.html()` and optional automatic Suspense support on an H3 app.
 *
 * @example
 *
 * ```tsx
 * import { H3 } from 'h3'
 * import { h3KitaHtml } from '@kitajs/h3-html-plugin'
 *
 * const app = new H3().register(h3KitaHtml({ autoSuspense: true }))
 * app.get('/', event => event.html(<html><body>Hello</body></html>))
 * ```
 *
 * @param options HTML response and request ID options.
 * @returns An H3 plugin that installs Kita support.
 */
export const h3KitaHtml = definePlugin<H3KitaHtmlOptions | undefined>(
  (h3, options = {}) => {
    h3.use((event, next) => {
      const context = getKitaContext(event, options.genRequestId)
      event[kAutoDoctype] = options.autoDoctype ?? true
      event.html = (html) => renderHtml(event, html)

      if (options.autoSuspense) {
        return runWithAutoSuspense(context.requestId, next)
      }

      return next()
    })
  }
)
