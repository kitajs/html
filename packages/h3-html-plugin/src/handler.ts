import { renderToStream, runWithAutoSuspense, SuspenseRoot } from '@kitajs/html/suspense'
import { defineHandler, type H3Event } from 'h3'
import { getKitaContext } from './context.js'
import { observeSuspense, prepareHtml } from './html.js'
import type { H3KitaHtmlOptions } from './plugin.js'
import { kAutoDoctype } from './utils.js'

/** Render callback accepted by {@linkcode defineKitaHandler}. */
export type KitaRender = (event: H3Event) => JSX.Element

/**
 * Defines an H3 handler that evaluates Kita JSX inside a request-owned Suspense session.
 *
 * Unlike `event.html()`, this handler reserves request state before the render callback
 * can yield, so an async root may create its first `AutoSuspense` boundary after an
 * `await`. The response is always streamed, including pages that do not use Suspense.
 *
 * @example
 *
 * ```tsx
 * import { AutoSuspense } from '@kitajs/html/suspense'
 * import { defineKitaHandler } from '@kitajs/h3-html-plugin'
 *
 * export default defineKitaHandler(async event => {
 *   const user = await loadUser(event)
 *
 *   return (
 *     <AutoSuspense fallback={<p>Loading...</p>}>
 *       <UserDetails user={user} />
 *     </AutoSuspense>
 *   )
 * })
 * ```
 *
 * @param render Callback that constructs the Kita JSX tree for a request.
 * @param options Doctype and request ID options.
 * @returns A fetch-compatible H3 event handler.
 */
export function defineKitaHandler(
  render: KitaRender,
  options: Pick<H3KitaHtmlOptions, 'autoDoctype' | 'genRequestId'> = {}
) {
  return defineHandler((event) => {
    const context = getKitaContext(event, options.genRequestId)

    if (SuspenseRoot.requests.has(context.requestId)) {
      throw new Error(`The provided Request Id is already in use: ${context.requestId}.`)
    }

    event[kAutoDoctype] = options.autoDoctype ?? true
    event.html = () => {
      throw new Error(
        '`event.html()` is unavailable inside `defineKitaHandler`; return JSX from the render callback instead.'
      )
    }
    event.res.headers.set('content-type', 'text/html; charset=utf-8')

    let synchronousError: unknown
    const stream = renderToStream(
      (requestId) =>
        runWithAutoSuspense(requestId, () => {
          let html: JSX.Element
          try {
            html = render(event)
          } catch (error) {
            synchronousError = error
            throw error
          }

          return typeof html === 'string'
            ? prepareHtml(event, html)
            : html.then((value) => prepareHtml(event, value))
        }),
      context.requestId
    )

    // renderToStream converts factory throws into stream errors after cleaning its
    // reservation. Rethrow here so failures known before a response exists use H3's normal
    // error response instead of returning a 200 stream that fails on first read.
    if (synchronousError !== undefined) {
      throw synchronousError
    }

    const requestData = SuspenseRoot.requests.get(context.requestId)

    // Factory rendering reserves state even before the first boundary exists. Observe the
    // exact reservation so a cancelled response cannot leak or affect a reused request ID.
    if (requestData) {
      observeSuspense(event, requestData, stream)
    }

    return stream
  })
}
