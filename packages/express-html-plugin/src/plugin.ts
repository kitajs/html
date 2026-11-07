import { runWithAutoSuspense } from '@kitajs/html/suspense'
import type { RequestHandler } from 'express'
import { handleHtml } from './html'
import { kAutoDoctype } from './utils'

function buildDefaultGenReqId() {
  // Match Fastify's default request id generator to keep ids compact and on the V8 SMI path.
  const maxInt = 2147483647

  let nextReqId = 0
  return function defaultGenReqId() {
    nextReqId = (nextReqId + 1) & maxInt
    return `req-${nextReqId.toString(36)}`
  }
}

/** Options for @kitajs/express-html-plugin middleware. */
export interface ExpressKitaHtmlOptions {
  /**
   * Whether to automatically add `<!doctype html>` to a response starting with <html>, if
   * not found.
   *
   * @default true
   */
  autoDoctype?: boolean

  /**
   * Whether the middleware should avoid assigning `req.id`.
   *
   * Disable this if another middleware already owns request ids. When disabled, you must
   * ensure `req.id` is available before using `Suspense rid={req.id}`.
   *
   * @default false
   */
  disableRequestId?: boolean

  /**
   * Whether to provide the request ID to `AutoSuspense` components automatically.
   *
   * When `disableRequestId` is also enabled, earlier middleware must assign `req.id`.
   * Regular `Suspense` components with an explicit `rid` do not require this option.
   *
   * @default false
   */
  autoSuspense?: boolean
}

/**
 * The `@kitajs/express-html-plugin` middleware.
 *
 * It decorates `res.html()`, optionally assigns `req.id`, and enables Suspense streaming
 * by matching that request id with `Suspense rid={req.id}`.
 *
 * @example
 *
 * ```tsx
 * import express from 'express'
 * import { expressKitaHtml } from '@kitajs/express-html-plugin'
 *
 * const app = express()
 *
 * app.use(expressKitaHtml())
 *
 * app.get('/', (req, res) => {
 *   res.html(
 *     <html lang="en">
 *       <body>
 *         <h1>Hello, world!</h1>
 *       </body>
 *     </html>
 *   )
 * })
 * ```
 */
export function expressKitaHtml(opts: ExpressKitaHtmlOptions = {}): RequestHandler {
  const genReqId = opts.disableRequestId ? null : buildDefaultGenReqId()

  return function kitaHtmlMiddleware(req, res, next) {
    if (!opts.disableRequestId) {
      req.id ??= genReqId!()
    }

    res[kAutoDoctype] = opts.autoDoctype ?? true
    res.html = handleHtml

    if (opts.autoSuspense) {
      runWithAutoSuspense(req.id, next)
      return
    }

    next()
  }
}

declare global {
  namespace Express {
    interface Request {
      /**
       * Stable request id used by `@kitajs/html/suspense`.
       *
       * Existing values are preserved. Otherwise the middleware assigns an id like
       * `req-1`, `req-2`, `req-3`, ... using base-36 numbering, unless `disableRequestId`
       * is enabled.
       */
      id: string | number
    }

    interface Response {
      /**
       * This gets assigned to every response instance. You can manually change this value
       * to `false` if you want to "hand pick" when or when not to add the doctype.
       */
      [kAutoDoctype]: boolean

      /**
       * Sends an HTML response to the browser. The response stream might remain open if
       * there are pending Suspense components.
       *
       * If the HTML does not start with a doctype and `opts.autoDoctype` is enabled, it
       * will be added automatically.
       *
       * The correct `Content-Type`, `Content-Length`, and `Transfer-Encoding` headers are
       * defined according to the html content being returned.
       *
       * @param html The HTML to send.
       */
      html<H extends JSX.Element>(
        this: this,
        html: H
      ): H extends Promise<string> ? Promise<void> : void
    }
  }
}
