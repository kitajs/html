import { resolveHtmlStream } from '@kitajs/html/suspense';
import { FastifyReply } from 'fastify';
import { isTagHtml, kAutoDoctype } from './utils';

export function handleHtml<H extends JSX.Element>(
  this: FastifyReply,
  htmlStr: H
): H extends Promise<string> ? Promise<void> : void {
  if (typeof htmlStr === 'string') {
    // @ts-expect-error - We return void to prevent the Reply | Promise<Reply> type, so this we ensure no one misuses the return value
    return handleSyncHtml(htmlStr, this);
  }

  // @ts-expect-error - We return void to prevent the Reply | Promise<Reply> type, so this we ensure no one misuses the return value
  return handleAsyncHtml(htmlStr, this);
}

/**
 * Simple helper that can be optimized by the JS engine to avoid having async await in the
 * main flow
 */
async function handleAsyncHtml(
  promise: Promise<string>,
  reply: FastifyReply
): Promise<void> {
  return handleSyncHtml(await promise, reply);
}

function handleSyncHtml(htmlStr: string, reply: FastifyReply) {
  // Prepends doctype if the html is a full html document
  if (reply[kAutoDoctype] && isTagHtml(htmlStr)) {
    htmlStr = `<!doctype html>${htmlStr}`;
  }

  reply.type('text/html; charset=utf-8');

  // If no suspense component was used, this will not be defined.
  const requestData = SUSPENSE_ROOT.requests.get(reply.request.id);

  if (requestData === undefined) {
    return reply
      .header('transfer-encoding', 'identity')
      .header('content-length', Buffer.byteLength(htmlStr, 'utf-8'))
      .send(htmlStr);
  }

  // Content-length is optional as long as the connection is closed after the response is done
  // https://www.rfc-editor.org/rfc/rfc7230#section-3.3.3
  //
  // Nodejs natively adds 'transfer-encoding: chunked' when returning a stream without content-length
  // https://nodejs.org/api/http.html#requestwritechunk-encoding-callback
  return reply.header('transfer-encoding', 'chunked').send(
    // htmlStr might resolve after one of its suspense components
    resolveHtmlStream(htmlStr, requestData)
  );
}
