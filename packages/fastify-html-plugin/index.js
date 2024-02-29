/// <reference path="./types/index.d.ts" />

//@ts-expect-error - internal fastify symbol
const { kReplyHeaders } = require('fastify/lib/symbols');
const fp = require('fastify-plugin');
const { pipeHtml } = require('@kitajs/html/suspense');
const { prependDoctype } = require('./lib/prepend-doctype');
const { isHtml } = require('./lib/is-html');
const {
  CONTENT_TYPE_HEADER,
  CONTENT_TYPE_VALUE,
  CONTENT_LENGTH_HEADER
} = require('./lib/constants');

/**
 * @type {import('fastify').FastifyPluginCallback<
 *   import('./types').FastifyKitaHtmlOptions
 * >}
 */
function fastifyKitaHtml(fastify, opts, next) {
  // Good defaults
  opts.autoDetect ??= true;
  opts.autoDoctype ??= true;
  opts.contentType ??= CONTENT_TYPE_VALUE;
  opts.isHtml ??= isHtml;

  /* global SUSPENSE_ROOT */
  // Enables suspense if it's not enabled yet
  SUSPENSE_ROOT.enabled ||= true;

  // The normal .html handler is much simpler than the streamHtml one
  fastify.decorateReply('html', html);
  fastify.decorateReply('setupHtmlStream', setupHtmlStream);

  // As JSX is evaluated from the inside out, renderToStream() method requires
  // a function to be able to execute some code before the JSX calls gets to
  // render, it can be avoided by simply executing the code in the
  // streamHtml getter method.
  fastify.decorateReply('streamHtml', {
    getter() {
      this.setupHtmlStream();
      return streamHtml;
    }
  });

  // The onSend hook is only used by autoDetect, so we can
  // skip adding it if it's not enabled.
  if (opts.autoDetect) {
    fastify.addHook('onSend', onSend);
  }

  return next();

  /** @type {import('fastify').FastifyReply['setupHtmlStream']} */
  function setupHtmlStream() {
    SUSPENSE_ROOT.requests.set(this.request.id, {
      // As reply.raw is a instance of Writable, we can use it instead of
      // creating a our own new stream.
      stream: new WeakRef(this.raw),
      running: 0,
      sent: false
    });

    return this;
  }

  /** @type {import('fastify').FastifyReply['html']} */
  function html(htmlStr) {
    // Handles possibility of html being a promise
    if (htmlStr instanceof Promise) {
      return htmlStr.then(html.bind(this));
    }

    this.header(CONTENT_LENGTH_HEADER, Buffer.byteLength(htmlStr.toString()));
    this.header(CONTENT_TYPE_HEADER, opts.contentType);

    if (opts.autoDoctype) {
      htmlStr = prependDoctype(htmlStr);
    }

    return this.send(htmlStr);
  }

  /** @type {import('fastify').FastifyReply['streamHtml']} */
  function streamHtml(htmlStr) {
    // Content-length is optional as long as the connection is closed after the response is done
    // https://www.rfc-editor.org/rfc/rfc7230#section-3.3.3
    this.header(CONTENT_TYPE_HEADER, opts.contentType);

    if (opts.autoDoctype) {
      // Handles possibility of html being a promise
      if (htmlStr instanceof Promise) {
        htmlStr = htmlStr.then(prependDoctype);
      } else {
        htmlStr = prependDoctype(htmlStr);
      }
    }

    // Hijacks the reply stream, so we can control when the stream is ended.
    this.hijack();

    // TODO: Add trailers support
    // @ts-expect-error - fastify internal implementation
    //
    // As the response was hijacked, we need to manually handle everything about it.
    // This includes previously defined headers, statusCode and trailers.
    //
    // Original implementation had a try/catch block around this
    // but as it would've already thrown an error when content-type header was
    // defined above, this catch is useless here.
    this.raw.writeHead(this.statusCode, this[kReplyHeaders]);

    // When the .streamHtml is called, the fastify decorator's getter method
    // already created the request data at the SUSPENSE_ROOT for us, so we
    // can simply pipe the first html wave to the reply stream.
    pipeHtml(htmlStr, this.raw, this.request.id);
    // pipeHtml calls write() and end() on the reply stream, so we don't need
    // to do it here.

    // The reply stream will be ended when the suspense root is resolved.
    return this;
  }

  /** @type {import('fastify').onSendHookHandler} */
  function onSend(_request, reply, payload, done) {
    // Streamed html should also return false here, because it's not a string,
    // and already was handled by the streamHtml method.
    if (opts.isHtml(payload)) {
      reply.header(CONTENT_TYPE_HEADER, opts.contentType);

      if (opts.autoDoctype) {
        // Payload will never be a promise here, because the content was already
        // serialized.
        payload = prependDoctype(payload);
      }
    }

    return done(null, payload);
  }
}

module.exports = fp(fastifyKitaHtml, {
  fastify: '4.x',
  name: '@kitajs/fastify-html-plugin'
});
module.exports.default = fastifyKitaHtml;
module.exports.fastifyKitaHtml = fastifyKitaHtml;
