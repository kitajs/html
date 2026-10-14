import {
  abortSuspenseRequest,
  runWithAutoSuspense,
  SuspenseRoot
} from '@kitajs/html/suspense'
import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { handleHtml } from './html'
import { kAutoDoctype } from './utils'

/** Options for @kitajs/fastify-html-plugin plugin. */
export interface FastifyKitaHtmlOptions {
  /**
   * Whether to automatically add `<!doctype html>` to a response starting with <html>, if
   * not found.
   *
   * ```tsx
   * // With autoDoctype: true you can just return the html
   * app.get('/', () => <html></html>)
   *
   * // With autoDoctype: false you must use rep.html
   * app.get('/', (req, rep) => rep.html(<html></html>)
   * ```
   *
   * @default true
   */
  autoDoctype?: boolean

  /**
   * Whether to provide the request ID to `AutoSuspense` components automatically.
   *
   * Regular `Suspense` components with an explicit `rid` do not require this option.
   *
   * @default false
   */
  autoSuspense?: boolean
}

/**
 * The `@kitajs/fastify-html-plugin` Fastify plugin.
 *
 * @example
 *
 * ```tsx
 * import Fastify from 'fastify';
 * import { fastifyKitaHtml } from '@kitajs/fastify-html-plugin';
 *
 * const app = Fastify();
 *
 * // Register the plugin
 * app.register(fastifyKitaHtml, { autoDoctype: true });
 *
 * app.get('/', (req, reply) =>
 *   reply.html(
 *     <html lang="en">
 *       <body>
 *         <h1>Hello, world!</h1>
 *       </body>
 *     </html>
 *   )
 * );
 *
 * app.listen({ port: 3000 });
 * ```
 */
export const fastifyKitaHtml: FastifyPluginCallback<FastifyKitaHtmlOptions> = fp(
  function (fastify, opts: FastifyKitaHtmlOptions, next) {
    fastify.decorateReply(kAutoDoctype, opts.autoDoctype ?? true)
    fastify.decorateReply('html', handleHtml)

    fastify.addHook('onRequestAbort', function suspenseAbortHook(request, done) {
      const requestData = SuspenseRoot.requests.get(request.id)

      if (requestData) {
        // Fastify reports transport aborts separately from successful response closure.
        abortSuspenseRequest(request.id, requestData)
      }

      done()
    })

    if (opts.autoSuspense) {
      // Enter at the earliest request hook so parsing, validation, user hooks, and the
      // route handler all inherit the same async-local request ID.
      fastify.addHook('onRequest', function autoSuspenseHook(request, _reply, done) {
        runWithAutoSuspense(request.id, done)
      })
    }

    return next()
  },
  {
    fastify: '4.x || 5.x',
    name: '@kitajs/fastify-html-plugin'
  }
)

// Module augmentation for FastifyReply
declare module 'fastify' {
  interface FastifyReply {
    /**
     * This gets assigned to every reply instance. You can manually change this value to
     * `false` if you want to "hand pick" when or when not to add the doctype.
     */
    [kAutoDoctype]: boolean

    /**
     * Returns an HTML response to the browser. The response stream might remain open if
     * there are pending Suspense components.
     *
     * If the HTML does not start with a doctype and `opts.autoDoctype` is enabled, it
     * will be added automatically.
     *
     * The correct `Content-Type`, `Content-Length` and `Transfer-Encoding` headers are
     * going to be defined according to the html content being returned.
     *
     * @example
     *
     * ```tsx
     * app.get('/', (req, reply) =>
     *  reply.html(
     *    <html lang="en">
     *      <body>
     *        <h1>Hello, world!</h1>
     *      </body>
     *    </html>
     *   )
     * );
     *
     * app.get('/stream', (req, reply) =>
     *  reply.html(
     *    <Suspense rid={req.id} fallback={<div>Loading...</div>}>
     *      {Promise.resolve(<div>Content loaded!</div>)}
     *    </Suspense>
     *   )
     * );
     * ```
     *
     * @param html The HTML to send.
     */
    html<H extends JSX.Element>(
      this: this,
      html: H
    ): H extends Promise<string> ? Promise<void> : void
  }
}
