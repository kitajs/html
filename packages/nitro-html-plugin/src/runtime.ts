import { defineKitaHandler } from '@kitajs/h3-html-plugin'
import { defineHandler, HTTPError, type H3Event } from 'nitro'
import type { NitroHtmlPage } from './types.js'

export interface CreatePageHandlerOptions {
  /** Whether HTML document roots automatically receive a doctype. */
  autoDoctype: boolean

  /** Whether the page is Nitro's unmatched-route renderer. */
  renderer?: boolean
}

/**
 * Creates the H3 runtime handler used by generated virtual page modules.
 *
 * Ordinary pages delegate directly to `defineKitaHandler`. Renderer pages additionally
 * constrain the otherwise methodless Nitro renderer to GET and HEAD requests.
 *
 * @param page The convention page's default export.
 * @param options Generated runtime behavior.
 * @returns A fetch-compatible H3 handler.
 * @internal
 */
export function createPageHandler(
  page: NitroHtmlPage,
  options: CreatePageHandlerOptions
) {
  if (typeof page !== 'function') {
    throw new TypeError('A Kita Nitro page must default-export a function.')
  }

  const handler = defineKitaHandler(page, { autoDoctype: options.autoDoctype })

  if (!options.renderer) {
    return handler
  }

  return defineHandler(function renderer(event: H3Event) {
    if (event.req.method !== 'GET' && event.req.method !== 'HEAD') {
      throw new HTTPError({
        status: 405,
        statusText: 'Method Not Allowed',
        headers: { allow: 'GET, HEAD' }
      })
    }

    return handler(event)
  })
}
