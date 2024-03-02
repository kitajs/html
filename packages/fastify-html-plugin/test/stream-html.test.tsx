// This file is mearly a copy of the original test/suspense.test.tsx from @kitajs/html
// original source.
// https://github.com/kitajs/html/blob/master/test/suspense.test.tsx
//
// This was adapted to work inside a fastify route handler.

import Html, { PropsWithChildren } from '@kitajs/html';
import { Suspense, SuspenseScript } from '@kitajs/html/suspense';
import fastify from 'fastify';
import { JSDOM } from 'jsdom';
import assert from 'node:assert';
import { afterEach, describe, test } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import { fastifyKitaHtml } from '..';
import { CONTENT_TYPE_VALUE } from '../lib/constants';

async function SleepForMs({ ms, children }: PropsWithChildren<{ ms: number }>) {
  await setTimeout(ms * 2);
  return Html.contentsToString([children || String(ms)]);
}

describe('Suspense', () => {
  // Detect leaks of pending promises
  afterEach(() => {
    assert.equal(SUSPENSE_ROOT.requests.size, 0, 'Suspense root left pending resources');

    // Reset suspense root
    SUSPENSE_ROOT.enabled = false;
    SUSPENSE_ROOT.autoScript = true;
    SUSPENSE_ROOT.requestCounter = 1;
    SUSPENSE_ROOT.requests.clear();
  });

  test('Sync without suspense', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (_, res) => res.streamHtml(<div />));

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], CONTENT_TYPE_VALUE);
    assert.strictEqual(res.body, '<div></div>');
  });

  test('Suspense sync children', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.streamHtml(
        <Suspense rid={req.id} fallback={<div>1</div>}>
          <div>2</div>
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], CONTENT_TYPE_VALUE);
    assert.strictEqual(res.body, '<div>2</div>');
  });

  test('Suspense async children', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.streamHtml(
        <Suspense rid={req.id} fallback={<div>1</div>}>
          <SleepForMs ms={2} />
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], CONTENT_TYPE_VALUE);
    assert.strictEqual(
      res.body,
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {SuspenseScript}

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
      res.streamHtml(
        <Suspense rid={req.id} fallback={<div>1</div>}>
          <SleepForMs ms={2} />
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], CONTENT_TYPE_VALUE);
    assert.strictEqual(
      res.body,
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {SuspenseScript}

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
      res.streamHtml(
        <Suspense rid={req.id} fallback={Promise.resolve(<div>1</div>)}>
          <div>2</div>
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], CONTENT_TYPE_VALUE);
    assert.strictEqual(res.body, '<div>2</div>');
  });

  test('Multiple async renders cleanup', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.streamHtml(
        <Suspense rid={req.id} fallback={Promise.resolve(<div>1</div>)}>
          <SleepForMs ms={2} />
        </Suspense>
      )
    );

    const promises = [];

    for (const _ of Array.from({ length: 100 })) {
      promises.push(
        app.inject({ method: 'GET', url: '/' }).then((res) => {
          assert.strictEqual(res.statusCode, 200);
          assert.strictEqual(res.headers['content-type'], CONTENT_TYPE_VALUE);
          assert.strictEqual(
            res.body,
            <>
              <div id="B:1" data-sf>
                <div>1</div>
              </div>

              {SuspenseScript}

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
      res.streamHtml(
        <Suspense rid={req.id} fallback={Promise.resolve(<div>1</div>)}>
          <SleepForMs ms={2} />
        </Suspense>
      )
    );

    for (let i = 0; i < 10; i++) {
      const res = await app.inject({ method: 'GET', url: '/' });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.headers['content-type'], CONTENT_TYPE_VALUE);
      assert.strictEqual(
        res.body,
        <>
          <div id="B:1" data-sf>
            <div>1</div>
          </div>

          {SuspenseScript}

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
      res.streamHtml(
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

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], CONTENT_TYPE_VALUE);

    assert.strictEqual(
      res.body,
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

        {SuspenseScript}

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

      return res.streamHtml(
        <div>
          {Array.from({ length: seconds }, (_, i) => (
            <Suspense rid={req.id} fallback={<div>{seconds - i} loading</div>}>
              <SleepForMs ms={seconds - i} />
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
      // biome-ignore lint/style/noNonNullAssertion: this is a test
      const seconds = +result.headers.seconds!;

      assert.strictEqual(result.statusCode, 200);
      assert.strictEqual(result.headers['content-type'], CONTENT_TYPE_VALUE);
      assert.strictEqual(
        result.body,
        <>
          <div>
            {Array.from({ length: seconds }, (_, i) => (
              <div id={`B:${i + 1}`} data-sf>
                <div>{seconds - i} loading</div>
              </div>
            ))}
          </div>

          {SuspenseScript}

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

  test('throws if used outside of streamHtml', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (_, res) =>
      res.html(
        <Suspense rid={1} fallback={'1'}>
          {Promise.resolve(2)}
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8');
    assert.deepStrictEqual(res.json(), {
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Request data was deleted before all suspense components were resolved.'
    });
  });

  test('works with parallel deep suspense calls resolving first', async (t) => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.streamHtml(
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

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], CONTENT_TYPE_VALUE);

    await t.test('Html stream', () => {
      assert.strictEqual(
        res.body,
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

          {SuspenseScript}

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
    });

    await t.test('Browser simulation', async () => {
      // Simulates a browser
      assert.equal(
        new JSDOM(res.body, { runScripts: 'dangerously' }).window.document.body.innerHTML,
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
          {SuspenseScript}
        </>
      );
    });
  });

  test('tests suspense without error boundary', async () => {
    await using app = fastify();
    app.register(fastifyKitaHtml);

    app.get('/', (req, res) =>
      res.streamHtml(
        <Suspense rid={req.id} fallback={<div>1</div>}>
          {Promise.reject(new Error('component failed'))}
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.deepStrictEqual(res.json(), {
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
      res.streamHtml(
        <Suspense
          rid={req.id}
          fallback={<div>1</div>}
          catch={(err2) => {
            assert.equal(err2, err);
            return <div>3</div>;
          }}
        >
          {Promise.reject(err)}
        </Suspense>
      )
    );

    const res = await app.inject({ method: 'GET', url: '/' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], CONTENT_TYPE_VALUE);
    assert.strictEqual(
      res.body,
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {SuspenseScript}
        <template id="N:1" data-sr>
          <div>3</div>
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );
  });
});
