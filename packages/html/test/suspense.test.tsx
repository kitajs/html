import { JSDOM } from 'jsdom';
import assert from 'node:assert';
import { afterEach, describe, it, mock, test } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import Html, { PropsWithChildren } from '../index';
import { Suspense, SuspenseScript, renderToStream, renderToString } from '../suspense';

async function SleepForMs({ ms, children }: PropsWithChildren<{ ms: number }>) {
  await setTimeout(ms * 2);
  return Html.contentsToString([children || String(ms)]);
}

function Throw(): string {
  throw new Error('test');
}

// Detect leaks of pending promises
afterEach(() => {
  assert.equal(SUSPENSE_ROOT.requests.size, 0, 'Suspense root left pending requests');

  // Reset suspense root
  SUSPENSE_ROOT.enabled = false;
  SUSPENSE_ROOT.autoScript = true;
  SUSPENSE_ROOT.requestCounter = 1;
  SUSPENSE_ROOT.requests.clear();
});

describe('Suspense', () => {
  test('Sync without suspense', async () => {
    assert.equal(await renderToString(() => <div></div>), <div></div>);

    assert.equal(await renderToString(async () => <div></div>), <div></div>);
  });

  test('Suspense sync children', async () => {
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          <div>2</div>
        </Suspense>
      )),
      <div>2</div>
    );
  });

  test('Suspense async children', async () => {
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          <SleepForMs ms={2} />
        </Suspense>
      )),
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
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
          <SleepForMs ms={2} />
        </Suspense>
      )),
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
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
          <div>2</div>
        </Suspense>
      )),
      <>
        <div>2</div>
      </>
    );
  });

  test('Multiple async renders cleanup', async () => {
    await Promise.all(
      Array.from({ length: 100 }, () => {
        return renderToString((r) => {
          return (
            <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
              <SleepForMs ms={2} />
            </Suspense>
          );
        }).then((res) => {
          assert.equal(
            res,
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
      })
    );
  });

  test('Multiple sync renders cleanup', async () => {
    for (let i = 0; i < 10; i++) {
      assert.equal(
        await renderToString((r) => (
          <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
            <SleepForMs ms={2} />
          </Suspense>
        )),
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
    assert.equal(
      await renderToString((r) => (
        <div>
          <Suspense rid={r} fallback={<div>1</div>}>
            <SleepForMs ms={4} />
          </Suspense>

          <Suspense rid={r} fallback={<div>2</div>}>
            <SleepForMs ms={5} />
          </Suspense>

          <Suspense rid={r} fallback={<div>3</div>}>
            <SleepForMs ms={6} />
          </Suspense>
        </div>
      )),
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
    const promises = [];

    for (const seconds of [9, 4, 7]) {
      promises.push(
        renderToString((r) => (
          <div>
            {Array.from({ length: seconds }, (_, i) => (
              <Suspense rid={r} fallback={<div>{seconds - i} loading</div>}>
                <SleepForMs ms={seconds - i} />
              </Suspense>
            ))}
          </div>
        ))
      );
    }

    const results = await Promise.all(promises);

    assert.deepEqual(results, [
      <>
        <div>
          <div id="B:1" data-sf>
            <div>9 loading</div>
          </div>
          <div id="B:2" data-sf>
            <div>8 loading</div>
          </div>
          <div id="B:3" data-sf>
            <div>7 loading</div>
          </div>
          <div id="B:4" data-sf>
            <div>6 loading</div>
          </div>
          <div id="B:5" data-sf>
            <div>5 loading</div>
          </div>
          <div id="B:6" data-sf>
            <div>4 loading</div>
          </div>
          <div id="B:7" data-sf>
            <div>3 loading</div>
          </div>
          <div id="B:8" data-sf>
            <div>2 loading</div>
          </div>
          <div id="B:9" data-sf>
            <div>1 loading</div>
          </div>
        </div>

        {SuspenseScript}

        <template id="N:9" data-sr>
          1
        </template>
        <script id="S:9" data-ss>
          $KITA_RC(9)
        </script>
        <template id="N:8" data-sr>
          2
        </template>
        <script id="S:8" data-ss>
          $KITA_RC(8)
        </script>
        <template id="N:7" data-sr>
          3
        </template>
        <script id="S:7" data-ss>
          $KITA_RC(7)
        </script>
        <template id="N:6" data-sr>
          4
        </template>
        <script id="S:6" data-ss>
          $KITA_RC(6)
        </script>
        <template id="N:5" data-sr>
          5
        </template>
        <script id="S:5" data-ss>
          $KITA_RC(5)
        </script>
        <template id="N:4" data-sr>
          6
        </template>
        <script id="S:4" data-ss>
          $KITA_RC(4)
        </script>
        <template id="N:3" data-sr>
          7
        </template>
        <script id="S:3" data-ss>
          $KITA_RC(3)
        </script>
        <template id="N:2" data-sr>
          8
        </template>
        <script id="S:2" data-ss>
          $KITA_RC(2)
        </script>
        <template id="N:1" data-sr>
          9
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>,

      <>
        <div>
          <div id="B:1" data-sf>
            <div>4 loading</div>
          </div>
          <div id="B:2" data-sf>
            <div>3 loading</div>
          </div>
          <div id="B:3" data-sf>
            <div>2 loading</div>
          </div>
          <div id="B:4" data-sf>
            <div>1 loading</div>
          </div>
        </div>

        {SuspenseScript}

        <template id="N:4" data-sr>
          1
        </template>
        <script id="S:4" data-ss>
          $KITA_RC(4)
        </script>
        <template id="N:3" data-sr>
          2
        </template>
        <script id="S:3" data-ss>
          $KITA_RC(3)
        </script>
        <template id="N:2" data-sr>
          3
        </template>
        <script id="S:2" data-ss>
          $KITA_RC(2)
        </script>
        <template id="N:1" data-sr>
          4
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>,

      <>
        <div>
          <div id="B:1" data-sf>
            <div>7 loading</div>
          </div>
          <div id="B:2" data-sf>
            <div>6 loading</div>
          </div>
          <div id="B:3" data-sf>
            <div>5 loading</div>
          </div>
          <div id="B:4" data-sf>
            <div>4 loading</div>
          </div>
          <div id="B:5" data-sf>
            <div>3 loading</div>
          </div>
          <div id="B:6" data-sf>
            <div>2 loading</div>
          </div>
          <div id="B:7" data-sf>
            <div>1 loading</div>
          </div>
        </div>

        {SuspenseScript}

        <template id="N:7" data-sr>
          1
        </template>
        <script id="S:7" data-ss>
          $KITA_RC(7)
        </script>
        <template id="N:6" data-sr>
          2
        </template>
        <script id="S:6" data-ss>
          $KITA_RC(6)
        </script>
        <template id="N:5" data-sr>
          3
        </template>
        <script id="S:5" data-ss>
          $KITA_RC(5)
        </script>
        <template id="N:4" data-sr>
          4
        </template>
        <script id="S:4" data-ss>
          $KITA_RC(4)
        </script>
        <template id="N:3" data-sr>
          5
        </template>
        <script id="S:3" data-ss>
          $KITA_RC(3)
        </script>
        <template id="N:2" data-sr>
          6
        </template>
        <script id="S:2" data-ss>
          $KITA_RC(2)
        </script>
        <template id="N:1" data-sr>
          7
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    ]);
  });

  it('ensures autoScript works', async () => {
    // Sync does not needs autoScript
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          <div>2</div>
        </Suspense>
      )),
      <div>2</div>
    );

    // Async renders SuspenseScript
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          {Promise.resolve(<div>2</div>)}
        </Suspense>
      )),
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {SuspenseScript}

        <template id="N:1" data-sr>
          <div>2</div>
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );

    // Disable autoScript
    SUSPENSE_ROOT.autoScript = false;

    // Async renders SuspenseScript
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          {Promise.resolve(<div>2</div>)}
        </Suspense>
      )),
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>
        <template id="N:1" data-sr>
          <div>2</div>
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );
  });

  test('renderToStream', async () => {
    const stream = renderToStream((r) => (
      <div>
        <Suspense rid={r} fallback={<div>2</div>}>
          {Promise.resolve(<div>1</div>)}
        </Suspense>
      </div>
    ));

    assert(stream.readable);

    // emits end event
    const fn = mock.fn();
    stream.on('end', fn);

    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    assert.equal(fn.mock.calls.length, 1);
    assert.equal(chunks.length, 2);

    assert.equal(
      chunks[0].toString(),
      <div>
        <div id="B:1" data-sf>
          <div>2</div>
        </div>
      </div>
    );

    assert.equal(
      chunks[1].toString(),
      <>
        {SuspenseScript}
        <template id="N:1" data-sr>
          <div>1</div>
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );
  });

  test('renderToStream without suspense', async () => {
    const stream = renderToStream(() => '<div>not suspense</div>', 1227);

    assert.ok(stream.readable);

    const data = stream.read();

    assert.equal(data.toString(), '<div>not suspense</div>');

    for await (const _ of stream) {
      assert.fail('should not stream anything more');
    }

    assert.ok(stream.closed);
  });

  it('tests suspense without children', async () => {
    assert.equal(
      await renderToString((r) => (
        //@ts-expect-error - testing invalid children
        <Suspense rid={r} fallback={<div>1</div>} />
      )),
      ''
    );
  });

  it('throws if no stream is used', () => {
    SUSPENSE_ROOT.enabled = true;

    assert.throws(
      () => (
        <Suspense rid={1} fallback={'1'}>
          {Promise.resolve(2)}
        </Suspense>
      ),
      /Request data was deleted before all suspense components were resolved./
    );
  });

  it('works with async error handlers', async () => {
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>} catch={Promise.resolve(<div>2</div>)}>
          {Promise.reject(<div>3</div>)}
        </Suspense>
      )),

      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>
        {SuspenseScript}
        <template id="N:1" data-sr>
          <div>2</div>
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );
  });

  it('works with deep suspense calls', async () => {
    assert.equal(
      await renderToString((rid) => {
        return (
          <div>
            <Suspense rid={rid} fallback={<div>1</div>}>
              <div>2</div>

              {setTimeout(10, <div>3</div>)}

              {setTimeout(
                15,
                <div>
                  <Suspense rid={rid} fallback={<div>4</div>}>
                    <div>5</div>

                    {setTimeout(20, <div>6</div>)}
                  </Suspense>
                </div>
              )}
            </Suspense>
          </div>
        );
      }),
      <>
        <div>
          <div id="B:2" data-sf>
            <div>1</div>
          </div>
        </div>

        {SuspenseScript}

        <template id="N:2" data-sr>
          <div>2</div>
          <div>3</div>
          <div>
            <div id="B:1" data-sf>
              <div>4</div>
            </div>
          </div>
        </template>
        <script id="S:2" data-ss>
          $KITA_RC(2)
        </script>

        <template id="N:1" data-sr>
          <div>5</div>
          <div>6</div>
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );
  });

  it('works with deep suspense calls resolving first', async () => {
    assert.equal(
      await renderToString((rid) => {
        return (
          <div>
            <Suspense rid={rid} fallback={<div>1</div>}>
              <div>2</div>

              {setTimeout(20, <div>3</div>)}

              {setTimeout(
                15,
                <div>
                  <Suspense rid={rid} fallback={<div>4</div>}>
                    <div>5</div>

                    {setTimeout(10, <div>6</div>)}
                  </Suspense>
                </div>
              )}
            </Suspense>
          </div>
        );
      }),
      <>
        <div>
          <div id="B:2" data-sf>
            <div>1</div>
          </div>
        </div>

        {SuspenseScript}

        <template id="N:1" data-sr>
          <div>5</div>
          <div>6</div>
        </template>

        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>

        <template id="N:2" data-sr>
          <div>2</div>
          <div>3</div>
          <div>
            <div id="B:1" data-sf>
              <div>4</div>
            </div>
          </div>
        </template>

        <script id="S:2" data-ss>
          $KITA_RC(2)
        </script>
      </>
    );
  });

  it('works with parallel deep suspense calls resolving first', async () => {
    const html = await renderToString((rid) => (
      <div>
        {Array.from({ length: 5 }, (_, i) => (
          <Suspense rid={rid} fallback={<div>{i} fb outer</div>}>
            <div>Outer {i}!</div>

            <SleepForMs ms={i % 2 === 0 ? i / 2 : i}>
              <Suspense rid={rid} fallback={<div>{i} fb inner!</div>}>
                <SleepForMs ms={i}>
                  <div>Inner {i}!</div>
                </SleepForMs>
              </Suspense>
            </SleepForMs>
          </Suspense>
        ))}
      </div>
    ));

    assert.equal(
      html,
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

    // tests with final html result
    assert.equal(
      new JSDOM(html, { runScripts: 'dangerously' }).window.document.body.innerHTML,
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

  it('SuspenseScript is a valid JS code', () => {
    // removes <script ...> and </script> tags
    eval(SuspenseScript.slice(SuspenseScript.indexOf('>') + 1, -'</script>'.length));
  });
});

describe('Suspense errors', () => {
  it('Throws when called outside of renderToStream', () => {
    assert.throws(
      () => (
        <>
          <Suspense rid={1} fallback={<div>loading</div>}>
            <div>1</div>
          </Suspense>
        </>
      ),
      /Cannot use Suspense outside of a `renderToStream` call./
    );
  });

  it('tests sync errors are thrown', () => {
    assert.throws(() => {
      renderToStream((r) => (
        <Suspense rid={r} fallback={<div>fallback</div>}>
          <Throw />
        </Suspense>
      ));
    }, /test/);
  });

  it('test sync errors after suspense', () => {
    try {
      renderToStream((r) => (
        <div>
          {/* Throws after suspense registration */}
          <Suspense rid={r} fallback={<div>fallback</div>}>
            {setTimeout(50).then(() => (
              <div>1</div>
            ))}
          </Suspense>

          <div>
            <Throw />
          </div>
        </div>
      ));

      assert.fail('should throw');
    } catch (error: any) {
      assert.equal(error.message, 'test');
    }
  });

  it('tests suspense without error boundary', async () => {
    const err = new Error('component failed');

    try {
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          {Promise.reject(err)}
        </Suspense>
      ));

      assert.fail('should throw');
    } catch (error) {
      assert.equal(error, err);
    }
  });

  it('tests stream suspense without error boundary', async () => {
    const err = new Error('component failed');

    const stream = renderToStream((r) => (
      <Suspense rid={r} fallback={<div>1</div>}>
        {Promise.reject(err)}
      </Suspense>
    ));

    try {
      for await (const data of stream) {
        // Second stream would be the suspense result, which errors out
        assert.equal(
          data.toString(),
          <div id="B:1" data-sf>
            <div>1</div>
          </div>
        );
      }

      assert.fail('should throw');
    } catch (error) {
      assert.equal(error, err);
    }
  });

  it('tests suspense with function error boundary', async () => {
    const err = new Error('component failed');

    // Sync does not needs autoScript
    assert.equal(
      await renderToString((r) => (
        <Suspense
          rid={r}
          fallback={<div>1</div>}
          catch={(err2) => {
            assert.equal(err2, err);

            return <div>3</div>;
          }}
        >
          {Promise.reject(err)}
        </Suspense>
      )),
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

  it('throws when rid is not provided', () => {
    assert.rejects(
      renderToString(() => (
        //@ts-expect-error
        <Suspense fallback={<div>1</div>}>{Promise.resolve('123')}</Suspense>
      )),
      /Error: Suspense requires a `rid` to be specified./
    );
  });

  it('tests suspense with error boundary', async () => {
    const err = new Error('component failed');

    // Sync does not needs autoScript
    assert.equal(
      await renderToString((r) => (
        <Suspense rid={r} fallback={<div>1</div>} catch={<div>3</div>}>
          {Promise.reject(err)}
        </Suspense>
      )),
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

  it('does not write anything if stream is closed', async () => {
    const rendered = renderToStream(async (r) => {
      // Closes the stream rightly after
      const rd = SUSPENSE_ROOT.requests.get(r)!;

      return (
        <Suspense rid={r} fallback={<div>1</div>} catch={<div>2</div>}>
          {setTimeout(5).then(async () => {
            rd.stream.push(null);
            await new Promise((res) => rd.stream.once('close', res));
            return <div>3</div>;
          })}
        </Suspense>
      );
    });

    const firstChunk = await new Promise<string>((resolve) => {
      rendered.once('data', resolve);
    });

    await new Promise((res) => rendered.once('close', res));

    assert.equal(
      firstChunk.toString(),
      <div id="B:1" data-sf>
        <div>1</div>
      </div>
    );

    // In case any .push() is called after the stream is closed,
    // The error below would be thrown:
    // Error [ERR_STREAM_PUSH_AFTER_EOF]: stream.push() after EOF
    for await (const _ of rendered) {
      console.log(1, _.toString());
      assert.fail('should not stream anything');
    }
  });

  it('does not allows to use the same rid', async () => {
    let i = 1;

    function render(r: number | string) {
      return (
        <Suspense rid={r} fallback={<div>{i++}</div>}>
          {Promise.resolve(<div>{i++}</div>)}
        </Suspense>
      );
    }

    const stream = renderToStream(render, 1);
    assert.throws(
      () => renderToStream(render, 1),
      /Error: The provided Request Id is already in use: 1./
    );

    let html = '';

    for await (const data of stream) {
      html += data;
    }

    assert.equal(
      html,
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {SuspenseScript}

        <template id="N:1" data-sr>
          <div>2</div>
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );
  });

  it('emits error if factory function throws', async () => {
    const stream = renderToStream(async () => {
      throw new Error('Factory error');
    });

    try {
      for await (const _ of stream) {
        assert.fail('should not stream anything');
      }

      assert.fail('should throw');
    } catch (error: any) {
      assert.equal(error.message, 'Factory error');
    }
  });
});
