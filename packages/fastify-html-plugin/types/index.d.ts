import { FastifyPluginCallback } from 'fastify';

declare module 'fastify' {
  interface FastifyReply {
    /**
     * **Synchronously** waits for the component tree to resolve and sends it at once to
     * the browser.
     *
     * This method does not support the usage of `<Suspense />`, please use
     * {@linkcode streamHtml} instead.
     *
     * If the HTML does not start with a doctype and `opts.autoDoctype` is enabled, it
     * will be added automatically.
     *
     * The correct `Content-Type` header will also be defined.
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
     * ```
     *
     * @param html The HTML to send.
     * @returns The response.
     */
    html(this: this, html: JSX.Element): this | Promise<this>;

    /**
     * Sends the html to the browser as a single stream, the entire component tree will be
     * waited synchronously. When using any `Suspense`, its fallback will be synchronously
     * waited and sent to the browser in the original stream, as its children are
     * resolved, new pieces of html will be sent to the browser. When all `Suspense`s
     * pending promises are resolved, the connection is closed normally.
     *
     * ### `request.id` must be used as the `Suspense`'s `rid` parameter
     *
     * This method hijacks the response, as the html stream is just a single continuous
     * stream in the http body, any changes to the status code or headers after calling
     * this method **will not have effect**.
     *
     * If the HTML does not start with a doctype and `opts.autoDoctype` is enabled, it
     * will be added automatically. The correct `Content-Type` header will also be
     * defined.
     *
     * **Http trailers are not yet supported when using `streamHtml`**
     *
     * @example
     *
     * ```tsx
     * app.get('/', (req, reply) =>
     *  reply.streamHtml(
     *    <Suspense rid={req.id} fallback={<div>Loading...</div>}>
     *      <MyAsyncComponent />
     *    </Suspense>
     *   )
     * );
     * ```
     *
     * @param html The HTML to send.
     * @returns The response.
     */
    streamHtml(this: this, html: JSX.Element): this;

    /**
     * This function is called internally by the `streamHtml` getter.
     *
     * ### Executing code before sending the response and after creating your
     *
     * Html is a bad pattern and should be avoided!
     *
     * This function must be called **manually** at the top of the route handler when you
     * have to execute some code **after** your root layout and **before** the `streamHtml
     * call.
     *
     * If `setupHtmlStream` is executed and no call to `streamHtml` happens before the
     * request finishes, a memory leak will be created. Make sure that `setupHtmlStream`
     * will never be executed without being followed by `streamHtml`.
     *
     * @example
     *
     * ```tsx
     * app.get('/bad', (_, reply) => {
     *   const html = <Layout /> // Error: Request data was deleted before all
     *                           // suspense components were resolved.
     *
     *   // code that must be executed after the template
     *   foo();
     *
     *   return reply.streamHtml(html);
     * })
     *
     * app.get('/good', (_, reply) => {
     *   reply.setupHtmlStream();
     *
     *   const html = <Layout /> // works!
     *
     *   // code that must be executed after the template
     *   foo();
     *
     *   return reply.streamHtml(html);
     * })
     * ```
     */
    setupHtmlStream(this: this): this;
  }
}

type FastifyKitaHtmlPlugin = FastifyPluginCallback<
  NonNullable<Partial<fastifyKitaHtml.FastifyKitaHtmlOptions>>
>;

declare namespace fastifyKitaHtml {
  /** Options for @kitajs/fastify-html-plugin plugin. */
  export interface FastifyKitaHtmlOptions {
    /**
     * The value of the `Content-Type` header.
     *
     * @default 'text/html; charset=utf8'
     */
    contentType: string;

    /**
     * Whether to automatically detect HTML content and set the content-type when
     * `.html()` is not used.
     *
     * @default true
     */
    autoDetect: boolean;

    /**
     * Whether to automatically add `<!doctype html>` to a response starting with <html>,
     * if not found.
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
    autoDoctype: boolean;

    /**
     * The function used to detect if a string is a html or not when `autoDetect` is
     * enabled.
     *
     * Default implementation if length is greater than 3, starts with `<` and ends with
     * `>`.
     *
     * There's no real way to validate HTML, so this is a best guess.
     *
     * @see https://stackoverflow.com/q/1732348
     * @see https://stackoverflow.com/q/11229831
     */
    isHtml: (this: void, value: string) => boolean;
  }

  export const fastifyKitaHtml: FastifyKitaHtmlPlugin;

  export { fastifyKitaHtml as default };
}

export = fastifyKitaHtml;
