/// <reference path="./types/index.d.ts" />

const fp = require('fastify-plugin');
const { pipeHtml } = require('@kitajs/html/suspense');
const { prependDoctype } = require('./lib/prepend-doctype');
const { isHtml } = require('./lib/is-html');
const { CONTENT_TYPE_VALUE } = require('./lib/constants');
const { Readable } = require('stream');

function noop() {}

/**
 * @type {import('fastify').FastifyPluginCallback<
 *   import('./types').FastifyKitaHtmlOptions
 * >}
 */
function fastifyKitaHtml(fastify, opts, next) {
  // Enables suspense if it's not enabled yet
  SUSPENSE_ROOT.enabled ||= true;

  // Good defaults
  opts.autoDetect ??= true;
  opts.autoDoctype ??= true;
  opts.contentType ??= CONTENT_TYPE_VALUE;
  opts.isHtml ??= isHtml;

  // The normal .html handler is much simpler than the streamHtml one
  fastify.decorateReply('html', html);
  fastify.decorateReply('setupHtmlStream', setupHtmlStream);
  fastify.decorateRequest('replyHtmlStream', null);

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

  if (opts.autoDetect) {
    // The onSend hook is only used by autoDetect, so we can
    // skip adding it if it's not enabled.
    fastify.addHook('onSend', onSend);
  }

  return next();

  /** @type {import('fastify').FastifyReply['setupHtmlStream']} */
  function setupHtmlStream() {
    SUSPENSE_ROOT.requests.set(this.request.id, {
      // Creating a Readable is better than hijacking the reply stream
      // https://lirantal.com/blog/avoid-fastify-reply-raw-and-reply-hijack-despite-being-a-powerful-http-streams-tool
      stream: new Readable({ read: noop }),
      running: 0,
      sent: false
    });

    return this;
  }

  /** @type {import('fastify').FastifyReply['html']} */
  function html(htmlStr) {
    if (htmlStr instanceof Promise) {
      // Handles possibility of html being a promise
      return htmlStr.then(html.bind(this));
    }

    this.header('content-length', Buffer.byteLength(htmlStr));
    this.header('content-type', opts.contentType);

    if (opts.autoDoctype) {
      htmlStr = prependDoctype(htmlStr);
    }

    return this.send(htmlStr);
  }

  /** @type {import('fastify').FastifyReply['streamHtml']} */
  function streamHtml(htmlStr) {
    // Content-length is optional as long as the connection is closed after the response is done
    // https://www.rfc-editor.org/rfc/rfc7230#section-3.3.3
    this.header('content-type', opts.contentType);

    if (opts.autoDoctype) {
      if (htmlStr instanceof Promise) {
        // Handles possibility of html being a promise
        htmlStr = htmlStr.then(prependDoctype);
      } else {
        htmlStr = prependDoctype(htmlStr);
      }
    }

    // When the .streamHtml is called, the fastify decorator's getter method
    // already created the request data at the SUSPENSE_ROOT for us, so we
    // can simply pipe the first html wave to the reply stream.
    const requestData = SUSPENSE_ROOT.requests.get(this.request.id);

    /* c8 ignore next 5 */
    if (!requestData) {
      throw new Error(
        'The request data was not found, this is a bug in the fastify-html-plugin'
      );
    }

    // Pipes the HTML to the stream, this promise never
    // throws, so we don't need to handle it.
    pipeHtml(htmlStr, requestData.stream, this.request.id);

    return this.send(requestData.stream);
  }

  /** @type {import('fastify').onSendHookHandler} */
  function onSend(_request, reply, payload, done) {
    if (opts.isHtml(payload)) {
      // Streamed html should not enter here, because it's not a string,
      // and already was handled by the streamHtml method.
      reply.header('content-type', opts.contentType);

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
