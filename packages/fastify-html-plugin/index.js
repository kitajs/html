/// <reference path="./types/index.d.ts" />

const fp = require('fastify-plugin');
const { isTagHtml } = require('./lib/is-tag-html');
const { resolveHtmlStream } = require('@kitajs/html/suspense');

/** @type {import('./types/index').kAutoDoctype} */
const kAutoDoctype = Symbol.for('fastify-kita-html.autoDoctype');

/**
 * @type {import('fastify').FastifyPluginCallback<
 *   import('./types').FastifyKitaHtmlOptions
 * >}
 */
function plugin(fastify, opts, next) {
  fastify.decorateReply(kAutoDoctype, opts.autoDoctype ?? true);
  fastify.decorateReply('html', html);
  return next();
}

/** @type {import('fastify').FastifyReply['html']} */
function html(htmlStr) {
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
 *
 * @template {import('fastify').FastifyReply} R
 * @param {Promise<string>} promise
 * @param {R} reply
 * @returns {Promise<R>}
 */
async function handleAsyncHtml(promise, reply) {
  return handleHtml(await promise, reply);
}

/**
 * @template {import('fastify').FastifyReply} R
 * @param {string} htmlStr
 * @param {R} reply
 */
function handleHtml(htmlStr, reply) {
  // @ts-expect-error - prepends doctype if the html is a full html document
  if (reply[kAutoDoctype] && isTagHtml(htmlStr)) {
    htmlStr = '<!doctype html>' + htmlStr;
  }

  reply.type('text/html; charset=utf-8');

  // If no suspense component was used, this will not be defined.
  const requestData = SUSPENSE_ROOT.requests.get(reply.request.id);

  if (requestData === undefined) {
    return reply
      .header('content-length', Buffer.byteLength(htmlStr, 'utf-8'))
      .send(htmlStr);
  }

  // Content-length is optional as long as the connection is closed after the response is done
  // https://www.rfc-editor.org/rfc/rfc7230#section-3.3.3
  return reply.send(
    // htmlStr might resolve after one of its suspense components
    resolveHtmlStream(htmlStr, requestData)
  );
}

const fastifyKitaHtml = fp(plugin, {
  fastify: '4.x',
  name: '@kitajs/fastify-html-plugin'
});

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
module.exports = fastifyKitaHtml;
module.exports.default = fastifyKitaHtml; // supersedes fastifyKitaHtml.default = fastifyKitaHtml
module.exports.fastifyKitaHtml = fastifyKitaHtml; // supersedes fastifyKitaHtml.fastifyKitaHtml = fastifyKitaHtml
module.exports.kAutoDoctype = kAutoDoctype;
