import type { Readable } from 'node:stream';
import type { Children } from './';

declare global {
  /**
   * The `SUSPENSE_ROOT` is a global object that holds the state of all the suspense
   * components rendered in the server.
   */
  var SUSPENSE_ROOT: {
    /**
     * The requests map is a map of RequestId x SuspenseData containing the stream to
     * write the HTML, the number of running promises and if the first suspense has
     * already resolved.
     */
    requests: Map<number | string, RequestData>;

    /**
     * This value is used (and incremented shortly after) when no requestId is provided
     * for {@linkcode renderToStream}
     *
     * @default 1
     */
    requestCounter: number;

    /**
     * If we should automatically stream {@linkcode SuspenseScript} before the first
     * suspense is rendered. If you disable this setting, you need to manually load the
     * {@linkcode SuspenseScript} in your HTML before any suspense is rendered. Otherwise,
     * the suspense will not work.
     *
     * @default true
     */
    autoScript: boolean;
  };
}

/** Everything a suspense needs to know about its request lifecycle. */
export type RequestData = {
  /** If the first suspense has already resolved */
  sent: boolean;

  /** How many are still running */
  running: number;

  /**
   * The stream we should write
   *
   * WeakRef requires ES2021 typings (node 14+) to be installed.
   */
  stream: Readable;
};

/**
 * A component that returns a fallback while the async children are loading.
 *
 * The `rid` prop is the one {@linkcode renderToStream} returns, this way the suspense
 * knows which request it belongs to.
 *
 * **Warning**: Using `Suspense` without any type of runtime support will _**LEAK
 * memory**_ and not work. Always use with `renderToStream` or within a framework that
 * supports it.
 */
export function Suspense(props: SuspenseProps): JSX.Element;

/**
 * Transforms a component tree who may contain `Suspense` components into a stream of
 * HTML.
 *
 * @example
 *
 * ```tsx
 * import { text} from 'node:stream/consumers';
 *
 * // Prints out the rendered stream (2nd example shows with a custom id)
 * const stream = renderToStream(r => <AppWithSuspense rid={r} />)
 * const stream = renderToStream(<AppWithSuspense rid={myCustomId} />, myCustomId)
 *
 * // You can consume it as a stream
 * for await (const html of stream) {
 *  console.log(html.toString())
 * }
 *
 * // Or join it all together (Wastes ALL Suspense benefits, but useful for testing)
 * console.log(await text(stream))
 * ```
 *
 * @param html The component tree to render or a function that returns the component tree.
 * @param rid The request id to identify the request, if not provided, a new incrementing
 *   id will be used.
 * @see {@linkcode Suspense}
 */
export function renderToStream(
  html: JSX.Element | ((rid: number | string) => JSX.Element),
  rid?: number | string
): Readable;

/**
 * Prepends the fallback into a html stream handled manually without
 * {@linkcode renderToStream}.
 *
 * **This API is meant to be used by library authors and should not be used directly.**
 *
 * @example
 *
 * ```tsx
 * const html = <RootLayout rid={rid} />
 * const requestData = SUSPENSE_ROOT.requests.get(rid);
 *
 * if(!requestData) {
 *   return html;
 * }
 *
 * // This prepends the html into the stream, handling possible
 * // cases where the html resolved after one of its async children
 * return writeFallback(html, requestData.stream);
 * ```
 *
 * @param fallback The fallback to render while the async children are loading.
 * @param stream The stream to write the fallback into.
 * @returns The same stream or another one with the fallback prepended.
 * @see {@linkcode renderToStream}
 */
export function writeFallback(fallback: JSX.Element, stream: Readable): Readable;

/**
 * This script needs to be loaded at the top of the page. You do not need to load it
 * manually, unless GLOBAL_SUSPENSE.autoScript is set to false.
 *
 * @see {@linkcode Suspense}
 */
export declare const SuspenseScript: string;

/**
 * The props for the `Suspense` component.
 *
 * @see {@linkcode Suspense}
 */
export interface SuspenseProps {
  /** The request id is used to identify the request for this suspense. */
  rid: number | string;

  /** The fallback to render while the async children are loading. */
  fallback: JSX.Element;

  /** The async children to render as soon as they are ready. */
  children: Children;

  /**
   * This error boundary is used to catch any error thrown by an async component and
   * streams its fallback instead.
   *
   * ### Undefined behaviors happens on each browser kind when the html stream is unexpected closed by the server if an error is thrown. You should always define an error boundary to catch errors.
   *
   * This does not catches for errors thrown by the suspense itself or async fallback
   * components. Please use {@linkcode ErrorBoundary} to catch them instead.
   */
  catch?: JSX.Element | ((error: unknown) => JSX.Element);
}
