import fastify from 'fastify';
import assert from 'node:assert';
import test, { describe } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { fastifyKitaHtml } from '..';
import { CONTENT_TYPE_HEADER, CONTENT_TYPE_VALUE } from '../lib/constants';

describe('reply.html()', () => {
  test('renders html', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (_, res) => res.html(<div>Hello from JSX!</div>));

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers[CONTENT_TYPE_HEADER], CONTENT_TYPE_VALUE);
    assert.strictEqual(res.body, '<div>Hello from JSX!</div>');
  });

  test('renders async html', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (_, res) =>
      res.html(<div>{setImmediate('Hello from async JSX!')}</div>)
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers[CONTENT_TYPE_HEADER], CONTENT_TYPE_VALUE);
    assert.strictEqual(res.body, '<div>Hello from async JSX!</div>');
  });

  test('fails when html is not a string', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (_, res) =>
      //@ts-expect-error - should fail
      res.html(12345)
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(
      res.headers[CONTENT_TYPE_HEADER],
      'application/json; charset=utf-8'
    );
    assert.deepStrictEqual(res.json(), {
      statusCode: 500,
      code: 'FST_ERR_REP_INVALID_PAYLOAD_TYPE',
      error: 'Internal Server Error',
      message:
        "Attempted to send payload of invalid type 'number'. Expected a string or Buffer."
    });
  });

  test('fails when html is not a string (promise)', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (_, res) =>
      //@ts-expect-error - should fail
      res.html(Promise.resolve(12345))
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(
      res.headers[CONTENT_TYPE_HEADER],
      'application/json; charset=utf-8'
    );
    assert.deepStrictEqual(res.json(), {
      statusCode: 500,
      code: 'FST_ERR_REP_INVALID_PAYLOAD_TYPE',
      error: 'Internal Server Error',
      message:
        "Attempted to send payload of invalid type 'number'. Expected a string or Buffer."
    });
  });
});
