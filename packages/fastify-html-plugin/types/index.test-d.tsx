import { Suspense } from '@kitajs/html/suspense';
import fastify from 'fastify';
import { fastifyKitaHtml } from '.';

const app = fastify();

app.register(fastifyKitaHtml);

app.register(fastifyKitaHtml, {
  autoDetect: true,
  autoDoctype: true,
  contentType: 'text/html; charset=utf-8',
  isHtml(value) {
    return value.length > 0;
  }
});

app.get('/', async (_, reply) => {
  reply.html('<div>hello world</div>');
});

app.get('/jsx', async (_, reply) => {
  reply.html(<div>hello world</div>);
});

app.get('/stream', async (_, reply) => {
  reply.streamHtml('<div>hello world</div>');
});

app.get('/stream/jsx', async (_, reply) => {
  reply.streamHtml(<div>hello world</div>);
});

app.get('/stream/suspense', async (request, reply) => {
  reply.streamHtml(
    <Suspense rid={request.id} fallback={<div>fallback</div>}>
      {Promise.resolve(1)}
    </Suspense>
  );
});
