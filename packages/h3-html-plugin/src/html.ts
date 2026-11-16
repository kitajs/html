import {
  abortSuspenseRequest,
  type RequestData,
  resolveHtmlStream,
  SuspenseRoot
} from '@kitajs/html/suspense'
import type { H3Event } from 'h3'
import type { Readable } from 'node:stream'
import { getKitaContext } from './context.js'
import { isTagHtml, kAutoDoctype } from './utils.js'

export type H3HtmlResult<H extends JSX.Element> =
  H extends Promise<string>
    ? Promise<string | NodeJS.ReadableStream>
    : string | NodeJS.ReadableStream

/**
 * Converts an already evaluated Kita JSX value into an H3 response value.
 *
 * Synchronous and ordinary asynchronous templates remain buffered. When the JSX tree has
 * registered Suspense state, the initial template and replacement chunks are returned as
 * a stream instead.
 *
 * @param event The active H3 event receiving response metadata.
 * @param html The Kita JSX value to return.
 * @returns Buffered HTML or a pending Suspense stream.
 */
export function renderHtml<H extends JSX.Element>(
  event: H3Event,
  html: H
): H3HtmlResult<H> {
  if (typeof html === 'string') {
    return renderSyncHtml(event, html) as H3HtmlResult<H>
  }

  if (html && typeof (html as Promise<string>).then === 'function') {
    return renderAsyncHtml(event, html as Promise<string>) as H3HtmlResult<H>
  }

  // Preserve framework error handling for invalid runtime input.
  return renderSyncHtml(event, html as unknown as string) as H3HtmlResult<H>
}

/** Resolves an asynchronous root without losing Suspense state that already exists. */
async function renderAsyncHtml(event: H3Event, html: Promise<string>) {
  const { requestId } = getKitaContext(event)
  const requestData = SuspenseRoot.requests.get(requestId)

  if (!requestData) {
    return renderSyncHtml(event, await html)
  }

  return renderStreamHtml(
    event,
    html.then((value) => prepareHtml(event, value)),
    requestData
  )
}

/** Handles a resolved root while preserving the fast buffered response path. */
function renderSyncHtml(event: H3Event, html: string) {
  html = prepareHtml(event, html)

  const { requestId } = getKitaContext(event)
  const requestData = SuspenseRoot.requests.get(requestId)

  event.res.headers.set('content-type', 'text/html; charset=utf-8')

  if (!requestData) {
    event.res.headers.set('content-length', Buffer.byteLength(html, 'utf-8').toString())
    return html
  }

  return renderStreamHtml(event, html, requestData)
}

/**
 * Adds the configured doctype after either a synchronous or asynchronous root resolves.
 *
 * @param event The event containing the per-response doctype setting.
 * @param html The resolved root template.
 * @returns The template with a doctype when required.
 */
export function prepareHtml(event: H3Event, html: string) {
  if (event[kAutoDoctype] && isTagHtml(html)) {
    return `<!doctype html>${html}`
  }

  return html
}

/**
 * Releases request-owned Suspense state when the incoming request is aborted.
 *
 * Runtimes may create the abort signal lazily and miss a disconnect that happened before
 * it was first read, so a renderer stream that closes before ending is also treated as an
 * abort. The captured `RequestData` identity prevents an older response from aborting a
 * newer request that happens to reuse the same public ID.
 *
 * @param event The event whose response lifecycle should be observed.
 * @param requestData The exact Suspense state owned by the response.
 * @param stream The renderer stream whose closure ends abort observation.
 */
export function observeSuspense(
  event: H3Event,
  requestData: RequestData,
  stream: Readable
) {
  const signal = event.req.signal

  if (signal.aborted) {
    abortResponse()
    return
  }

  signal.addEventListener('abort', abortResponse, { once: true })
  stream.once('close', function onStreamClose() {
    signal.removeEventListener('abort', abortResponse)

    // The runtime destroys the body when the client already went away, which the lazily
    // created signal may never report.
    if (!stream.readableEnded) {
      abortResponse()
    }
  })

  function abortResponse() {
    abortSuspenseRequest(requestData.rid, requestData)
  }
}

/**
 * Discards a rendered body for HEAD requests.
 *
 * Runtimes do not send a body for HEAD, so a returned stream may never be consumed and
 * its pending Suspense state would stay in `SuspenseRoot.requests` indefinitely.
 * Rendering still runs first so status and headers staged by synchronous code are
 * preserved.
 *
 * @param stream The renderer stream that would have been returned.
 * @param requestData The exact Suspense state owned by the response, if any.
 * @returns An empty body for the HEAD response.
 */
export function discardHeadBody(stream: Readable, requestData: RequestData | undefined) {
  if (requestData) {
    // Also destroys the stream returned by resolveHtmlStream.
    abortSuspenseRequest(requestData.rid, requestData)
  } else {
    // renderToStream returns a standalone stream when no Suspense state exists.
    stream.destroy()
  }

  return ''
}

/** Returns a root template followed by the replacement chunks owned by its request. */
function renderStreamHtml(event: H3Event, html: JSX.Element, requestData: RequestData) {
  event.res.headers.set('content-type', 'text/html; charset=utf-8')
  event.res.headers.delete('content-length')
  const stream = resolveHtmlStream(html, requestData)

  if (event.req.method === 'HEAD') {
    return discardHeadBody(stream, requestData)
  }

  observeSuspense(event, requestData, stream)
  return stream
}

declare module 'h3' {
  interface H3Event {
    /** Whether this response automatically receives a doctype before an HTML root. */
    [kAutoDoctype]: boolean

    /**
     * Returns Kita JSX as an HTML response value.
     *
     * Prefer `defineKitaHandler` when an async root can create its first Suspense
     * boundary after yielding because this method receives an already evaluated JSX
     * argument.
     */
    html<H extends JSX.Element>(html: H): H3HtmlResult<H>
  }
}
