import { type RequestData, resolveHtmlStream, SuspenseRoot } from '@kitajs/html/suspense'
import { FastifyReply } from 'fastify'
import { isTagHtml, kAutoDoctype } from './utils'

export function handleHtml<H extends JSX.Element>(
  this: FastifyReply,
  htmlStr: H
): H extends Promise<string> ? Promise<void> : void {
  if (typeof htmlStr === 'string') {
    // @ts-expect-error - We return void to prevent the Reply | Promise<Reply> type, so this we ensure no one misuses the return value
    return handleSyncHtml(htmlStr, this)
  }

  // @ts-expect-error - We return void to prevent the Reply | Promise<Reply> type, so this we ensure no one misuses the return value
  return handleAsyncHtml(htmlStr, this)
}

/**
 * Simple helper that can be optimized by the JS engine to avoid having async await in the
 * main flow
 */
async function handleAsyncHtml(
  promise: Promise<string>,
  reply: FastifyReply
): Promise<void> {
  // Capture state before awaiting so a fast boundary cannot finish and remove it while
  // another child keeps the root pending.
  const requestData = SuspenseRoot.requests.get(reply.request.id)

  if (requestData === undefined) {
    handleSyncHtml(await promise, reply)
    return
  }

  const template = promise.then(function prepareResolvedHtml(htmlStr) {
    return prepareHtml(htmlStr, reply)
  })

  return handleStreamHtml(template, requestData, reply)
}

function handleSyncHtml(htmlStr: string, reply: FastifyReply) {
  htmlStr = prepareHtml(htmlStr, reply)

  reply.type('text/html; charset=utf-8')

  // If no suspense component was used, this will not be defined.
  const requestData = SuspenseRoot.requests.get(reply.request.id)

  if (requestData === undefined) {
    return reply
      .header('content-length', Buffer.byteLength(htmlStr, 'utf-8'))
      .send(htmlStr)
  }

  return handleStreamHtml(htmlStr, requestData, reply)
}

/**
 * Adds the configured doctype after either a synchronous or asynchronous root resolves.
 *
 * @param htmlStr The root HTML template.
 * @param reply The reply containing the per-request doctype setting.
 * @returns The template with a doctype when required.
 */
function prepareHtml(htmlStr: string, reply: FastifyReply) {
  if (reply[kAutoDoctype] && isTagHtml(htmlStr)) {
    return `<!doctype html>${htmlStr}`
  }

  return htmlStr
}

/**
 * Sends the initial template followed by its Suspense replacement chunks.
 *
 * @param template The resolved or pending template containing Suspense fallbacks.
 * @param requestData The exact Suspense state owned by this response.
 * @param reply The Fastify reply receiving the stream.
 */
function handleStreamHtml(
  template: JSX.Element,
  requestData: RequestData,
  reply: FastifyReply
) {
  reply.type('text/html; charset=utf-8')

  // Content-length is optional as long as the connection is closed after the response is done
  // https://www.rfc-editor.org/rfc/rfc7230#section-3.3.3
  //
  // Nodejs natively adds 'transfer-encoding: chunked' when returning a stream without content-length
  // https://nodejs.org/api/http.html#requestwritechunk-encoding-callback
  return reply
    .header('transfer-encoding', 'chunked')
    .send(resolveHtmlStream(template, requestData))
}
