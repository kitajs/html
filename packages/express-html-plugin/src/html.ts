import {
  abortSuspenseRequest,
  type RequestData,
  resolveHtmlStream,
  SuspenseRoot
} from '@kitajs/html/suspense'
import type { Response } from 'express'
import { isTagHtml, kAutoDoctype } from './utils'

export function handleHtml<H extends JSX.Element>(
  this: Response,
  htmlStr: H
): H extends Promise<string> ? Promise<void> : void {
  if (typeof htmlStr === 'string') {
    // @ts-expect-error - We return void to prevent Express response misuse.
    return handleSyncHtml(htmlStr, this)
  }

  if (htmlStr && typeof (htmlStr as Promise<string>).then === 'function') {
    // @ts-expect-error - We return void to prevent Express response misuse.
    return handleAsyncHtml(htmlStr as Promise<string>, this)
  }

  // @ts-expect-error - Invalid runtime input should fail in the synchronous path.
  return handleSyncHtml(htmlStr, this)
}

/**
 * Simple helper that can be optimized by the JS engine to avoid having async await in the
 * main flow.
 */
async function handleAsyncHtml(
  promise: Promise<string>,
  response: Response
): Promise<void> {
  // Capture state before awaiting so a fast boundary cannot finish and remove it while
  // another child keeps the root pending.
  const requestData = SuspenseRoot.requests.get(response.req.id)

  if (requestData === undefined) {
    return handleSyncHtml(await promise, response)
  }

  const template = promise.then(function prepareResolvedHtml(htmlStr) {
    return prepareHtml(htmlStr, response)
  })
  handleStreamHtml(template, requestData, response)
}

function handleSyncHtml(htmlStr: string, response: Response) {
  htmlStr = prepareHtml(htmlStr, response)

  // If no suspense component was used, this will not be defined.
  const requestData = SuspenseRoot.requests.get(response.req.id)

  if (requestData === undefined) {
    // Compute the byte length before setting the content type so invalid runtime values
    // still reach Express error handlers without committing text/html headers first.
    response
      .setHeader('content-length', Buffer.byteLength(htmlStr, 'utf-8'))
      .type('text/html; charset=utf-8')
      .send(htmlStr)

    return
  }

  handleStreamHtml(htmlStr, requestData, response)
}

/**
 * Adds the configured doctype after either a synchronous or asynchronous root resolves.
 *
 * @param htmlStr The root HTML template.
 * @param response The response containing the per-request doctype setting.
 * @returns The template with a doctype when required.
 */
function prepareHtml(htmlStr: string, response: Response) {
  if (response[kAutoDoctype] && isTagHtml(htmlStr)) {
    return `<!doctype html>${htmlStr}`
  }

  return htmlStr
}

/**
 * Sends the initial template followed by its Suspense replacement chunks.
 *
 * @param template The resolved or pending template containing Suspense fallbacks.
 * @param requestData The exact Suspense state owned by this response.
 * @param response The Express response receiving the stream.
 */
function handleStreamHtml(
  template: JSX.Element,
  requestData: RequestData,
  response: Response
) {
  const stream = resolveHtmlStream(template, requestData)

  // Content-length is optional as long as the connection is closed after the response is done.
  // https://www.rfc-editor.org/rfc/rfc7230#section-3.3.3
  response.type('text/html; charset=utf-8').setHeader('transfer-encoding', 'chunked')

  // The socket closes before stream completion only when the client disconnects.
  response.req.socket.once('close', abortClosedResponse)
  stream.once('end', clearAbortHandler)

  function abortClosedResponse() {
    abortSuspenseRequest(response.req.id, requestData)
  }

  function clearAbortHandler() {
    // A completed renderer stream no longer needs disconnect cleanup.
    response.req.socket.removeListener('close', abortClosedResponse)
  }

  stream.once('error', (error) => {
    if (response.headersSent) {
      response.destroy(error)
      return
    }

    response.status(500).end(error instanceof Error ? error.message : String(error))
  })

  stream.pipe(response)
}
