import { resolveHtmlStream, SuspenseRoot } from '@kitajs/html/suspense'
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
  return handleSyncHtml(await promise, response)
}

function handleSyncHtml(htmlStr: string, response: Response) {
  if (response[kAutoDoctype] && isTagHtml(htmlStr)) {
    htmlStr = `<!doctype html>${htmlStr}`
  }

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

  const stream = resolveHtmlStream(htmlStr, requestData)

  // Content-length is optional as long as the connection is closed after the response is done.
  // https://www.rfc-editor.org/rfc/rfc7230#section-3.3.3
  response.type('text/html; charset=utf-8').setHeader('transfer-encoding', 'chunked')

  stream.once('error', (error) => {
    if (response.headersSent) {
      response.destroy(error)
      return
    }

    response.status(500).end(error instanceof Error ? error.message : String(error))
  })

  stream.pipe(response)
}
