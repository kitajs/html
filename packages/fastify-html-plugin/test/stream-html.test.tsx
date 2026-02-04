// This file is mearly a copy of the original test/suspense.test.tsx from @kitajs/html
// original source.
// https://github.com/kitajs/html/blob/master/test/suspense.test.tsx
//
// This was adapted to work inside a fastify route handler.

import Html, { type PropsWithChildren } from '@kitajs/html';
import { Suspense, SuspenseScript as safeSuspenseScript } from '@kitajs/html/suspense';
import fastify from 'fastify';
import { JSDOM } from 'jsdom';
import { setTimeout } from 'node:timers/promises';
import { afterEach, describe, expect, test } from 'vitest';
import { fastifyKitaHtml } from '../src';

async function SleepForMs({ ms, children }: PropsWithChildren<{ ms: number }>) {
  await setTimeout(ms * 50);
  return Html.contentsToString([children || String(ms)]);
}

describe('Suspense', () => {
  // Detect leaks of pending promises
  afterEach(() => {
    expect(SUSPENSE_ROOT.requests.size).toBe(0);

    // Reset suspense root
    SUSPENSE_ROOT.autoScript = true;
    SUSPENSE_ROOT.requestCounter = 1;
    SUSPENSE_ROOT.requests.clear();
  });

  test('Sync without suspense', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (_, res) => res.html(<div />));

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.body).toBe('<div></div>');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
  });

  test('Suspense sync children', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={<div>1</div>}>
          <div>2</div>
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.body).toBe('<div>2</div>');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
  });

  test('Suspense async children', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={<div>1</div>}>
          <SleepForMs ms={2} />
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.body).toBe(
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {safeSuspenseScript}

        <template id="N:1" data-sr>
          2
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );
  });

  test('Suspense async children & fallback', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={<div>1</div>}>
          <SleepForMs ms={2} />
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.body).toBe(
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {safeSuspenseScript}

        <template id="N:1" data-sr>
          2
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );
  });

  test('Suspense async fallback sync children', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={Promise.resolve(<div>1</div>)}>
          <div>2</div>
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.body).toBe('<div>2</div>');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
  });

  test('Multiple async renders cleanup', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={Promise.resolve(<div>1</div>)}>
          <SleepForMs ms={2} />
        </Suspense>
      )
    );

    const promises = [];

    for (const _ of Array.from({ length: 100 })) {
      promises.push(
        app.inject({ method: 'GET', url: '/' }).then((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
          expect(res.body).toBe(
            <>
              <div id="B:1" data-sf>
                <div>1</div>
              </div>

              {safeSuspenseScript}

              <template id="N:1" data-sr>
                2
              </template>
              <script id="S:1" data-ss>
                $KITA_RC(1)
              </script>
            </>
          );
        })
      );
    }

    await Promise.all(promises);
  });

  test('Multiple sync renders cleanup', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={Promise.resolve(<div>1</div>)}>
          <SleepForMs ms={2} />
        </Suspense>
      )
    );

    for (let i = 0; i < 10; i++) {
      const res = await app.inject({ method: 'GET', url: '/' });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
      expect(res.body).toBe(
        <>
          <div id="B:1" data-sf>
            <div>1</div>
          </div>

          {safeSuspenseScript}

          <template id="N:1" data-sr>
            2
          </template>
          <script id="S:1" data-ss>
            $KITA_RC(1)
          </script>
        </>
      );
    }
  });

  test('Multiple children', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.html(
        <div>
          <Suspense rid={req.id} fallback={<div>1</div>}>
            <SleepForMs ms={4} />
          </Suspense>

          <Suspense rid={req.id} fallback={<div>2</div>}>
            <SleepForMs ms={5} />
          </Suspense>

          <Suspense rid={req.id} fallback={<div>3</div>}>
            <SleepForMs ms={6} />
          </Suspense>
        </div>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');

    expect(res.body).toBe(
      <>
        <div>
          <div id="B:1" data-sf>
            <div>1</div>
          </div>
          <div id="B:2" data-sf>
            <div>2</div>
          </div>
          <div id="B:3" data-sf>
            <div>3</div>
          </div>
        </div>

        {safeSuspenseScript}

        <template id="N:1" data-sr>
          4
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>

        <template id="N:2" data-sr>
          5
        </template>
        <script id="S:2" data-ss>
          $KITA_RC(2)
        </script>

        <template id="N:3" data-sr>
          6
        </template>
        <script id="S:3" data-ss>
          $KITA_RC(3)
        </script>
      </>
    );
  });

  test('Concurrent renders', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) => {
      const seconds = (req.query as { seconds: number }).seconds;
      res.header('seconds', seconds);

      return res.html(
        <div>
          {Array.from({ length: seconds }, (_, i) => (
            <Suspense rid={req.id} fallback={<div>{seconds - i} loading</div>}>
              <SleepForMs ms={seconds - i}>{seconds - i}</SleepForMs>
            </Suspense>
          ))}
        </div>
      );
    });

    const secondsArray = [9, 4, 7];
    const results = await Promise.all(
      secondsArray.map((seconds) =>
        app.inject({
          method: 'GET',
          url: '/',
          query: { seconds: seconds.toString() }
        })
      )
    );

    for (const result of results) {
      const seconds = +result.headers.seconds!;

      expect(result.statusCode).toBe(200);
      expect(result.headers['content-type']).toBe('text/html; charset=utf-8');
      expect(result.body).toBe(
        <>
          <div>
            {Array.from({ length: seconds }, (_, i) => (
              <div id={`B:${i + 1}`} data-sf>
                <div>{seconds - i} loading</div>
              </div>
            ))}
          </div>

          {safeSuspenseScript}

          {Array.from({ length: seconds }, (_, i) => (
            <>
              <template id={`N:${seconds - i}`} data-sr>
                {i + 1}
              </template>
              <script id={`S:${seconds - i}`} data-ss>
                $KITA_RC({seconds - i})
              </script>
            </>
          ))}
        </>
      );
    }
  });

  test('works with parallel deep suspense calls resolving first', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.html(
        <div>
          {Array.from({ length: 5 }, (_, i) => (
            <Suspense rid={req.id} fallback={<div>{i} fb outer</div>}>
              <div>Outer {i}!</div>

              <SleepForMs ms={i % 2 === 0 ? i / 2 : i}>
                <Suspense rid={req.id} fallback={<div>{i} fb inner!</div>}>
                  <SleepForMs ms={i}>
                    <div>Inner {i}!</div>
                  </SleepForMs>
                </Suspense>
              </SleepForMs>
            </Suspense>
          ))}
        </div>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');

    expect(res.body).toBe(
      <>
        <div>
          <div id="B:2" data-sf>
            <div>0 fb outer</div>
          </div>
          <div id="B:4" data-sf>
            <div>1 fb outer</div>
          </div>
          <div id="B:6" data-sf>
            <div>2 fb outer</div>
          </div>
          <div id="B:8" data-sf>
            <div>3 fb outer</div>
          </div>
          <div id="B:10" data-sf>
            <div>4 fb outer</div>
          </div>
        </div>

        {safeSuspenseScript}

        <template id="N:1" data-sr>
          <div>Inner 0!</div>
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>

        <template id="N:2" data-sr>
          <div>Outer 0!</div>
          <div id="B:1" data-sf>
            <div>0 fb inner!</div>
          </div>
        </template>
        <script id="S:2" data-ss>
          $KITA_RC(2)
        </script>

        <template id="N:3" data-sr>
          <div>Inner 1!</div>
        </template>
        <script id="S:3" data-ss>
          $KITA_RC(3)
        </script>

        <template id="N:4" data-sr>
          <div>Outer 1!</div>
          <div id="B:3" data-sf>
            <div>1 fb inner!</div>
          </div>
        </template>
        <script id="S:4" data-ss>
          $KITA_RC(4)
        </script>

        <template id="N:6" data-sr>
          <div>Outer 2!</div>
          <div id="B:5" data-sf>
            <div>2 fb inner!</div>
          </div>
        </template>
        <script id="S:6" data-ss>
          $KITA_RC(6)
        </script>

        <template id="N:5" data-sr>
          <div>Inner 2!</div>
        </template>
        <script id="S:5" data-ss>
          $KITA_RC(5)
        </script>

        <template id="N:10" data-sr>
          <div>Outer 4!</div>
          <div id="B:9" data-sf>
            <div>4 fb inner!</div>
          </div>
        </template>
        <script id="S:10" data-ss>
          $KITA_RC(10)
        </script>

        <template id="N:7" data-sr>
          <div>Inner 3!</div>
        </template>
        <script id="S:7" data-ss>
          $KITA_RC(7)
        </script>

        <template id="N:8" data-sr>
          <div>Outer 3!</div>
          <div id="B:7" data-sf>
            <div>3 fb inner!</div>
          </div>
        </template>
        <script id="S:8" data-ss>
          $KITA_RC(8)
        </script>

        <template id="N:9" data-sr>
          <div>Inner 4!</div>
        </template>
        <script id="S:9" data-ss>
          $KITA_RC(9)
        </script>
      </>
    );

    // Browser simulation
    expect(
      new JSDOM(res.body, { runScripts: 'dangerously' }).window.document.body.innerHTML
    ).toBe(
      <>
        <div>
          <div>Outer 0!</div>
          <div>Inner 0!</div>
          <div>Outer 1!</div>
          <div>Inner 1!</div>
          <div>Outer 2!</div>
          <div>Inner 2!</div>
          <div>Outer 3!</div>
          <div>Inner 3!</div>
          <div>Outer 4!</div>
          <div>Inner 4!</div>
        </div>
        {safeSuspenseScript}
      </>
    );
  });

  test('tests suspense without error boundary', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={<div>1</div>}>
          {Promise.reject(new Error('component failed')) as Promise<'safe'>}
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.json()).toEqual({
      error: 'Internal Server Error',
      message: 'component failed',
      statusCode: 500
    });
  });

  test('tests suspense with function error boundary', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    const err = new Error('component failed');

    app.get('/', (req, res) =>
      res.html(
        <Suspense
          rid={req.id}
          fallback={<div>1</div>}
          catch={(err2) => {
            expect(err2).toBe(err);
            return <div>3</div>;
          }}
        >
          {Promise.reject(err) as Promise<'safe'>}
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.body).toBe(
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {safeSuspenseScript}
        <template id="N:1" data-sr>
          <div>3</div>
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );
  });

  test('stream outputs raw HTML (Fastify handles chunked transfer encoding at HTTP level)', async () => {
    // This test verifies that the stream output is clean HTML without manual chunk markers.
    // HTTP chunked transfer encoding is handled automatically by Fastify/Node.js at the
    // protocol level when streaming responses without a Content-Length header.

    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.html(
        <Suspense rid={req.id} fallback={<div>loading</div>}>
          <SleepForMs ms={1} />
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    expect(res.statusCode).toBe(200);
    // Response should be clean HTML starting with the actual content
    expect(res.body.startsWith('<div id="B:1"')).toBe(true);
    // Should NOT contain manual chunk size markers (e.g., "28\r\n<div>...\r\n")
    expect(res.body).not.toMatch(/^[0-9a-f]+\r\n/i);
  });
});
