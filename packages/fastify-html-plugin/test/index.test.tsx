import fastify from 'fastify';
import { setImmediate } from 'node:timers/promises';
import { describe, expect, test } from 'vitest';
import { fastifyKitaHtml } from '..';

describe('reply.html()', () => {
  test('renders html', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (_, res) => res.html(<div>Hello from JSX!</div>));

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.body).toBe('<div>Hello from JSX!</div>');
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.statusCode).toBe(200);
  });

  test('renders async html', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (_, res) =>
      res.html(<div safe>{setImmediate('Hello from async JSX!')}</div>)
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.body).toBe('<div>Hello from async JSX!</div>');
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.statusCode).toBe(200);
  });

  test('fails when html is not a string', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (_, res) =>
      //@ts-expect-error - should fail
      res.html(12345)
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({
      statusCode: 500,
      code: 'ERR_INVALID_ARG_TYPE',
      error: 'Internal Server Error',
      message:
        'The "string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received type number (12345)'
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

    expect(res.statusCode).toBe(500);
    expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(res.json()).toEqual({
      statusCode: 500,
      code: 'ERR_INVALID_ARG_TYPE',
      error: 'Internal Server Error',
      message:
        'The "string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received type number (12345)'
    });
  });
});
