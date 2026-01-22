import { resolveHtmlStream } from '@kitajs/html/suspense';
import type { FastifyPluginCallback, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

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
  autoDoctype: boolean;
}

/**
 * This gets assigned to every reply instance. You can manually change this value to
 * `false` if you want to "hand pick" when or when not to add the doctype.
 */
export const kAutoDoctype = Symbol.for('fastify-kita-html.autoDoctype');

/** Returns true if the string starts with `<html`, **ignores whitespace and casing**. */
const isTagHtml = RegExp.prototype.test.bind(/^\s*<html/i);

const plugin: FastifyPluginCallback<NonNullable<Partial<FastifyKitaHtmlOptions>>> =
  function (fastify, opts, next) {
    fastify.decorateReply(kAutoDoctype, opts.autoDoctype ?? true);
    fastify.decorateReply('html', html);
    return next();
  };

function html<H extends JSX.Element>(
  this: FastifyReply,
  htmlStr: H
): H extends Promise<string> ? Promise<void> : void {
  if (typeof htmlStr === 'string') {
    // @ts-expect-error - generics break the type inference here
    return handleHtml(htmlStr, this);
  }

  // @ts-expect-error - generics break the type inference here
  return handleAsyncHtml(htmlStr, this);
}

/**
 * Simple helper that can be optimized by the JS engine to avoid having async await in the
 * main flow
 */
async function handleAsyncHtml<R extends FastifyReply>(
  promise: Promise<string>,
  reply: R
): Promise<R> {
  return handleHtml(await promise, reply);
}

function handleHtml<R extends FastifyReply>(htmlStr: string, reply: R): R {
  // Prepends doctype if the html is a full html document
  if (reply[kAutoDoctype] && isTagHtml(htmlStr)) {
    htmlStr = `<!doctype html>${htmlStr}`;
  }

  reply.type('text/html; charset=utf-8');

  // If no suspense component was used, this will not be defined.
  const requestData = SUSPENSE_ROOT.requests.get(reply.request.id);

  if (requestData === undefined) {
    return reply
      .header('content-length', Buffer.byteLength(htmlStr, 'utf-8'))
      .send(htmlStr) as R;
  }

  // Content-length is optional as long as the connection is closed after the response is done
  // https://www.rfc-editor.org/rfc/rfc7230#section-3.3.3
  return reply.send(
    // htmlStr might resolve after one of its suspense components
    resolveHtmlStream(htmlStr, requestData)
  ) as R;
}

const plugin_ = fp(plugin, {
  fastify: '4.x || 5.x',
  name: '@kitajs/fastify-html-plugin'
});

export const fastifyKitaHtml = Object.assign(plugin_, { kAutoDoctype });

/**
 * These export configurations enable JS and TS developers to consume
 *
 * @kitajs/fastify-html-plugin in whatever way best suits their needs. Some examples of
 * supported import syntax includes:
 *
 * - `const fastifyKitaHtml = require('@kitajs/fastify-html-plugin')`
 * - `const { fastifyKitaHtml } = require('@kitajs/fastify-html-plugin')`
 * - `import * as fastifyKitaHtml from '@kitajs/fastify-html-plugin'`
 * - `import { fastifyKitaHtml } from '@kitajs/fastify-html-plugin'`
 * - `import fastifyKitaHtml from '@kitajs/fastify-html-plugin'`
 */
export default fastifyKitaHtml;

// Module augmentation for FastifyReply
declare module 'fastify' {
  interface FastifyReply {
    /**
     * This gets assigned to every reply instance. You can manually change this value to
     * `false` if you want to "hand pick" when or when not to add the doctype.
     */
    [kAutoDoctype]: boolean;

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
    html<H extends JSX.Element>(
      this: this,
      html: H
    ): H extends Promise<string> ? Promise<void> : void;
  }
}
