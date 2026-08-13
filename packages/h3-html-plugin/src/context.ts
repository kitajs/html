import type { H3Event } from 'h3'

/** Request-local state installed by {@linkcode h3KitaHtml}. */
export interface H3KitaHtmlContext {
  /** Stable identifier used to isolate Suspense output for this request. */
  requestId: string | number
}

let nextRequestId = 0

/**
 * Generates compact process-local IDs while keeping the counter on V8's small-integer
 * path. Request IDs only need to be unique among active requests in this process.
 */
function defaultRequestId() {
  nextRequestId = (nextRequestId + 1) & 2147483647
  return `req-${nextRequestId.toString(36)}`
}

/**
 * Returns the Kita state for an H3 event, creating it once when necessary.
 *
 * Reusing the context is important because explicit Suspense boundaries, automatic
 * Suspense, response rendering, and abort cleanup must all refer to the same ID.
 *
 * @param event The active H3 event.
 * @param genRequestId Optional application-specific request ID generator.
 * @returns The stable Kita state for this event.
 */
export function getKitaContext(
  event: H3Event,
  genRequestId?: (event: H3Event) => string | number
): H3KitaHtmlContext {
  return (event.context.kitaHtml ??= {
    requestId: genRequestId?.(event) ?? defaultRequestId()
  })
}

declare module 'h3' {
  interface H3EventContext {
    /** Request-local state owned by `@kitajs/h3-html-plugin`. */
    kitaHtml?: H3KitaHtmlContext
  }
}
