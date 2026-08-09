import { AsyncLocalStorage } from 'node:async_hooks'
import { PassThrough, Readable } from 'node:stream'
import type { Children } from './index.js'
import { contentsToString, contentToString } from './index.js'

/**
 * The `SuspenseRoot` is a store that holds the state of all the suspense components
 * rendered in the server.
 *
 * This was previously a global object called `SUSPENSE_ROOT`, but it was moved out of the
 * global scope to avoid many issues related to global state.
 */
export const SuspenseRoot = {
  /**
   * The requests map is a map of RequestId x SuspenseData containing the stream to write
   * the HTML, the number of running promises and if the first suspense has already
   * resolved.
   */
  requests: new Map<number | string, RequestData>(),

  /**
   * This value is used (and incremented shortly after) when no requestId is provided for
   * {@linkcode renderToStream}
   *
   * @default 1
   */
  requestCounter: 1,

  /**
   * Propagates the current request ID through synchronous and asynchronous rendering for
   * {@linkcode AutoSuspense}.
   *
   * Framework integrations enter this storage before invoking request handlers, allowing
   * nested boundaries to resolve their request ID without receiving it as a prop.
   */
  requestIdStorage: new AsyncLocalStorage<number | string>(),

  /**
   * If we should automatically stream {@linkcode SuspenseScript} before the first suspense
   * is rendered. If you disable this setting, you need to manually load the
   * {@linkcode SuspenseScript} in your HTML before any suspense is rendered. Otherwise,
   * the suspense will not work.
   *
   * @default true
   */
  autoScript: true
}

/** Everything a suspense needs to know about its request lifecycle. */
export type RequestData = {
  /** The request ID that owns this state. */
  rid: number | string

  /** If the first suspense has already resolved */
  sent: boolean

  /** How many are still running */
  running: number

  /** Monotonic sequence used to assign unique boundary marker IDs. */
  nextBoundaryId: number

  /** Whether an unresolved root still owns this state. */
  pendingRoot: boolean

  /** The response stream waiting for an unresolved root. */
  responseStream: PassThrough | undefined

  /**
   * The stream we should write
   *
   * WeakRef requires ES2021 typings (node 14+) to be installed.
   */
  stream: Readable
}

/**
 * The props for the `Suspense` component.
 *
 * @see {@linkcode Suspense}
 */
export interface SuspenseProps {
  /** The request id is used to identify the request for this suspense. */
  rid: number | string

  /** The fallback to render while the async children are loading. */
  fallback: JSX.Element

  /** The async children to render as soon as they are ready. */
  children: Children

  /**
   * This error boundary is used to catch any error thrown by an async component and
   * streams its fallback instead.
   *
   * ### Undefined behaviors happens on each browser kind when the html stream is unexpected closed by the server if an error is thrown. You should always define an error boundary to catch errors.
   *
   * This does not catches for errors thrown by the suspense itself or async fallback
   * components. Please use {@linkcode ErrorBoundary} to catch them instead.
   */
  catch?: JSX.Element | ((error: unknown) => JSX.Element)
}

/** Props accepted by {@linkcode AutoSuspense}. */
export type AutoSuspenseProps = Omit<SuspenseProps, 'rid'>

/**
 * Runs a callback with the request ID used by {@linkcode AutoSuspense}.
 *
 * Framework integrations use this before route handlers execute so nested synchronous and
 * asynchronous components can share the request ID without receiving it as a prop.
 *
 * @param rid The request ID to associate with automatic Suspense boundaries.
 * @param callback The callback that constructs the JSX tree.
 * @returns The callback result without awaiting or otherwise changing it.
 */
export function runWithAutoSuspense<R>(rid: number | string, callback: () => R): R {
  if (rid === undefined) {
    throw new Error('Automatic Suspense requires a request ID.')
  }

  return SuspenseRoot.requestIdStorage.run(rid, callback)
}

function noop() {}

/**
 * Closes request state after its async root and all Suspense boundaries have settled.
 *
 * @param rid The request ID associated with the state.
 * @param data The request state to close when it is no longer active.
 */
function finishRequest(rid: number | string, data: RequestData) {
  if (data.running !== 0 || data.pendingRoot) {
    return
  }

  if (!data.stream.destroyed && !data.stream.closed) {
    data.stream.push(null)
  }

  // The same public ID may already belong to a newer request, which must not be deleted
  // when older state finishes late.
  if (SuspenseRoot.requests.get(rid) === data) {
    SuspenseRoot.requests.delete(rid)
  }
}

/**
 * Releases Suspense state owned by a response that has closed before rendering finished.
 *
 * Later promise settlements are ignored, and identity checks prevent an older response
 * from deleting state belonging to a newer response with the same request ID.
 *
 * @param rid The request ID associated with the response.
 * @param data The exact request state captured by the response integration.
 */
export function abortSuspenseRequest(rid: number | string, data: RequestData) {
  data.pendingRoot = false

  if (SuspenseRoot.requests.get(rid) === data) {
    SuspenseRoot.requests.delete(rid)
  }

  const responseStream = data.responseStream

  if (responseStream && !responseStream.destroyed) {
    responseStream.destroy()
  }

  if (!data.stream.destroyed) {
    data.stream.destroy()
  }
}

/**
 * Small client-side helper used to replace suspense fallbacks with streamed template
 * content.
 *
 * As this script is the only residue of this package that is actually sent to the client,
 * it's important to keep it as small as possible and also include the license to avoid
 * legal issues.
 *
 * It requires support for `<template>.content` and `Element.remove()`. IE11 is not
 * supported.
 *
 * Pending data-sr elements are kept pending if their fallback has not yet been rendered,
 * on each render a try to switch all pending data-sr is attempted until no elements are
 * substituted.
 *
 * This script must be loaded before streamed suspense replacement chunks execute. You do
 * not need to load it manually unless {@linkcode SuspenseRoot.autoScript} is set to
 * false.
 *
 * @see {@linkcode Suspense}
 */
export const SuspenseScript = /* html */ `
      <script>
        /*! MIT License https://html.kitajs.org */
        function $KITA_RC(i){
          // simple aliases
          var d=document,q=d.querySelector.bind(d),
            // div sent as the fallback wrapper
            v=q('div[id="B:'+i+'"][data-sf]'),
            // template and script sent after promise finishes
            t=q('template[id="N:'+i+'"][data-sr]'),s=q('script[id="S:'+i+'"][data-ss]'),
            // fragment created to avoid inserting element one by one
            f=d.createDocumentFragment(),
            // used by iterators
            c,j,
            // all pending hydrations
            r;

          // if div or template is not found, let this hydration as pending
          if(t&&v&&s){
            // appends into the fragment
            while(c=t.content.firstChild)
              f.appendChild(c);

            // Intentionally throws if something else already removed or moved the fallback.
            // That means the streamed suspense markers and the live DOM are out of sync.
            v.parentNode.replaceChild(f,v);
            t.remove();
            s.remove();

            // looks for pending templates
            // TODO: Avoid a full document rescan after every replacement.
            r=d.querySelectorAll('template[id][data-sr]');

            do{
              // resets j & c from previous loop
              c=j=0;

              // loops over every found pending template and
              for(;c<r.length;c++)
                if(r[c]!=t)
                  // let j as true while at least on $KITA_RC call returns true
                  j=$KITA_RC(r[c].id.slice(2))?!0:j;
            }while(j)

            // we know at least the original template was substituted
            return!0;
          }
        }
      </script>
    `
  // Removes comment lines
  .replace(/^\s*\/\/.*/gm, '')
  // Removes line breaks added for readability
  .replace(/\n\s*/g, '')

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
export function Suspense(props: SuspenseProps): JSX.Element {
  const children = Array.isArray(props.children)
    ? contentsToString(props.children)
    : contentToString(props.children)

  // Returns content if it's not a promise
  if (typeof children === 'string') {
    return children
  }

  if (!props.rid && props.rid !== 0) {
    throw new Error('Suspense requires a truthy `rid` to be specified.')
  }

  let data = SuspenseRoot.requests.get(props.rid)

  if (!data) {
    // Creating the request data lazily allows
    // faster render() calls when no suspense
    // components are used.
    data = {
      rid: props.rid,
      stream: new Readable({ read: noop }),
      running: 0,
      nextBoundaryId: 0,
      pendingRoot: false,
      sent: false,
      responseStream: undefined
    }

    SuspenseRoot.requests.set(props.rid, data)
  }

  data.running += 1

  // Unlike the active count, marker IDs must never decrement or be reused when an
  // earlier boundary settles out of order.
  const run = ++data.nextBoundaryId
  const suspenseKey = `${props.rid}:${run}`

  void children
    .then(writeStreamTemplate)
    .catch(function errorRecover(error) {
      // No catch block was specified, so we can
      // re-throw the error.
      if (!props.catch) {
        throw error
      }

      let html: JSX.Element

      // Unwraps error handler
      if (typeof props.catch === 'function') {
        html = props.catch(error)
      } else {
        html = props.catch
      }

      // handles if catch block returns a string
      if (typeof html === 'string') {
        return writeStreamTemplate(html)
      }

      // must be a promise
      return html.then(writeStreamTemplate)
    })
    .catch(function writeFatalError(error) {
      if (SuspenseRoot.requests.get(props.rid) === data && !data.stream.destroyed) {
        data.stream.emit('error', error)
      }
    })
    .finally(function clearRequestData() {
      if (!data) {
        // Without request state this boundary never incremented the running count.
        return
      }

      data.running -= 1

      // The last boundary cannot close the stream while its async root still owns it.
      finishRequest(props.rid, data)
    })

  // Always will be a single children because multiple
  // root tags aren't a valid JSX syntax
  const fallback = contentToString(props.fallback)

  // Keeps string return type
  if (typeof fallback === 'string') {
    return `<div id="B:${suspenseKey}" data-sf>${fallback}</div>`
  }

  return fallback.then(function resolveCallback(resolved) {
    return `<div id="B:${suspenseKey}" data-sf>${resolved}</div>`
  })

  /**
   * This function may be called by the catch handler in case the error could be handled.
   *
   * @param result
   */
  function writeStreamTemplate(result: string) {
    if (
      // just to typecheck
      !data ||
      // A reused ID may now belong to another response.
      SuspenseRoot.requests.get(props.rid) !== data ||
      // Stream was already closed/cleared out.
      data.stream.destroyed ||
      data.stream.closed
    ) {
      return
    }

    // Writes the suspense script if its the first
    // suspense component in this request data. This way following
    // templates+scripts can be executed
    if (SuspenseRoot.autoScript && data.sent === false) {
      data.stream.push(SuspenseScript)
      data.sent = true
    }

    // Writes the chunk
    data.stream.push(
      // prettier-ignore
      `<template id="N:${suspenseKey}" data-sr>${result}</template><script id="S:${suspenseKey}" data-ss>$KITA_RC(${JSON.stringify(suspenseKey)})</script>`
    )
  }
}

/**
 * A Suspense boundary that obtains its request ID from the current automatic Suspense
 * scope.
 *
 * Framework integrations establish this scope when their `autoSuspense` option is
 * enabled. Use {@linkcode Suspense} with an explicit `rid` outside those environments.
 *
 * @example
 *
 * ```tsx
 * <AutoSuspense fallback={<div>Loading...</div>}>
 *   <AsyncContent />
 * </AutoSuspense>
 * ```
 *
 * @throws If no automatic Suspense scope is active.
 */
export function AutoSuspense(props: AutoSuspenseProps): JSX.Element {
  const rid = SuspenseRoot.requestIdStorage.getStore()

  if (!rid) {
    throw new Error(
      'AutoSuspense requires automatic Suspense support. Enable `autoSuspense` in your framework integration or use `Suspense` with an explicit `rid`.'
    )
  }

  return Suspense({ ...props, rid })
}

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
): Readable {
  if (!rid && rid !== 0) {
    rid = SuspenseRoot.requestCounter++
  } else if (SuspenseRoot.requests.has(rid)) {
    // Ensures the request id is unique within the current request
    // error here to keep original stack trace
    const error = new Error(`The provided Request Id is already in use: ${rid}.`)

    // returns errored stream to avoid throws
    return new Readable({
      read() {
        this.emit('error', error)
        this.push(null)
      }
    })
  }

  if (typeof html === 'function') {
    const requestData: RequestData = {
      rid,
      stream: new Readable({ read: noop }),
      running: 0,
      nextBoundaryId: 0,
      pendingRoot: true,
      sent: false,
      responseStream: undefined
    }

    // Reserve request state before an async factory can resume and create its first
    // Suspense boundary.
    SuspenseRoot.requests.set(rid, requestData)

    try {
      html = html(rid)
    } catch (error) {
      requestData.pendingRoot = false

      // No root will consume this reservation, and registered children may settle after
      // the returned error stream has already closed.
      if (!requestData.stream.closed) {
        requestData.stream.push(null)
      }

      if (SuspenseRoot.requests.get(rid) === requestData) {
        SuspenseRoot.requests.delete(rid)
      }

      // returns errored stream to avoid throws
      return new Readable({
        read() {
          this.emit('error', error)
          this.push(null)
        }
      })
    }

    if (typeof html === 'string') {
      // A synchronous factory cannot create more boundaries after returning, so its root
      // reservation is no longer needed.
      requestData.pendingRoot = false

      // Preserve the ordinary stream path when the reservation was never used.
      if (requestData.running === 0) {
        finishRequest(rid, requestData)
        return Readable.from([html])
      }
    }
  }

  // If no suspense component was used, this will not be defined.
  const requestData = SuspenseRoot.requests.get(rid)

  // No suspense was used, just return the HTML as a stream
  if (!requestData) {
    if (typeof html === 'string') {
      return Readable.from([html])
    }

    return new Readable({
      read() {
        void html
          .then((result) => {
            this.push(result)
            this.push(null)
          })
          .catch((error) => {
            this.emit('error', error)
          })
      }
    })
  }

  return resolveHtmlStream(html, requestData)
}

/**
 * Joins the html base template (with possible suspense's fallbacks) with the request data
 * and returns the final Readable to be piped into the response stream.
 *
 * **This API is meant to be used by library authors and should not be used directly.**
 *
 * @example
 *
 * ```tsx
 * const html = <RootLayout rid={rid} />
 * const requestData = SuspenseRoot.requests.get(rid);
 *
 * if(!requestData) {
 *   return html;
 * }
 *
 * // This prepends the html into the stream, handling possible
 * // cases where the html resolved after one of its async children
 * return resolveHtmlStream(html, requestData)
 * ```
 *
 * @param template The initial HTML template, possibly containing suspense fallbacks.
 * @param requestData The request data containing the stream to write resolved content
 *   into.
 * @returns The same stream or a new one with the template prepended.
 * @see {@linkcode renderToStream}
 */
export function resolveHtmlStream(
  template: JSX.Element,
  requestData: RequestData
): Readable {
  // Impossible to sync templates have their
  // streams being written (sent = true) before the fallback
  if (typeof template === 'string') {
    requestData.stream.push(template)
    return requestData.stream
  }

  // Framework integrations pass unresolved roots here before awaiting them. Retaining
  // ownership prevents a fast boundary from closing its stream first.
  if (SuspenseRoot.requests.get(requestData.rid) === requestData) {
    requestData.pendingRoot = true
  }

  const prepended = new PassThrough()
  requestData.responseStream = prepended
  prepended.once('close', function clearResponseStream() {
    // Do not clear a newer wrapper if a library resolved the same request data twice.
    if (requestData.responseStream === prepended) {
      requestData.responseStream = undefined
    }
  })

  void template
    .then(
      function resolveTemplateHtml(result) {
        // The owning HTTP response may have been aborted while the root was pending.
        if (prepended.destroyed) {
          return
        }

        prepended.push(result)
        requestData.stream.pipe(prepended)
      },
      function handleTemplateError(error) {
        if (!prepended.destroyed) {
          prepended.emit('error', error)
        }
      }
    )
    .finally(function releasePendingRoot() {
      // Release only after the initial template is queued, keeping buffered replacement
      // chunks behind the fallbacks they target.
      if (requestData.pendingRoot) {
        requestData.pendingRoot = false
        finishRequest(requestData.rid, requestData)
      }
    })

  return prepended
}
