import { JSDOM } from 'jsdom';
import { text } from 'node:stream/consumers';
import { setImmediate, setTimeout } from 'node:timers/promises';
import { afterEach, describe, expect, it, test, vi } from 'vitest';
import { Html, type PropsWithChildren } from '../src/index.js';
import {
  Suspense,
  renderToStream,
  SuspenseScript as safeSuspenseScript
} from '../src/suspense.js';

async function SleepForMs({ ms, children }: PropsWithChildren<{ ms: number }>) {
  await setTimeout(ms * 50);
  return Html.contentsToString([children || String(ms)]);
}

function Throw(): string {
  throw new Error('test');
}

// Detect leaks of pending promises
afterEach(() => {
  expect(SUSPENSE_ROOT.requests.size).toBe(0);

  // Reset suspense root
  SUSPENSE_ROOT.autoScript = true;
  SUSPENSE_ROOT.requestCounter = 1;
  SUSPENSE_ROOT.requests.clear();
});

describe('Suspense', () => {
  test('Sync without suspense', async () => {
    expect(await text(renderToStream(() => <div />))).toBe(<div />);

    expect(await text(renderToStream(async () => <div />))).toBe(<div />);
  });

  test('Suspense sync children', async () => {
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>1</div>}>
            <div>2</div>
          </Suspense>
        ))
      )
    ).toBe(<div>2</div>);
  });

  test('Suspense async children', async () => {
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>1</div>}>
            <SleepForMs ms={2} />
          </Suspense>
        ))
      )
    ).toBe(
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
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
            <SleepForMs ms={2} />
          </Suspense>
        ))
      )
    ).toBe(
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
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
            <div>2</div>
          </Suspense>
        ))
      )
    ).toBe(
      <>
        <div>2</div>
      </>
    );
  });

  test('Multiple async renders cleanup', async () => {
    await Promise.all(
      Array.from({ length: 100 }, () => {
        return text(
          renderToStream((r) => {
            return (
              <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
                <SleepForMs ms={2} />
              </Suspense>
            );
          })
        ).then((res) => {
          expect(res).toBe(
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
      })
    );
  });

  test('Multiple sync renders cleanup', async () => {
    for (let i = 0; i < 10; i++) {
      expect(
        await text(
          renderToStream((r) => (
            <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
              <SleepForMs ms={2} />
            </Suspense>
          ))
        )
      ).toBe(
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
    expect(
      await text(
        renderToStream((r) => (
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
        ))
      )
    ).toBe(
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
    const promises = [];

    for (const seconds of [9, 4, 7]) {
      const length = promises.push(
        text(
          renderToStream((r) => (
            <div>
              {Array.from({ length: seconds }, (_, i) => (
                <Suspense rid={r} fallback={<div>{seconds - i} loading</div>}>
                  <SleepForMs ms={seconds - i}>{seconds - i}</SleepForMs>
                </Suspense>
              ))}
            </div>
          ))
        )
      );

      //@ts-expect-error - testing invalid promises
      promises[length - 1]!.seconds = seconds;
    }

    const results = await Promise.all(promises);

    for (const [index, result] of results.entries()) {
      //@ts-expect-error - testing invalid promises
      const seconds = +promises[index]!.seconds;

      expect(result).toBe(
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

  it('ensures autoScript works', async () => {
    // Sync does not needs autoScript
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>1</div>}>
            <div>2</div>
          </Suspense>
        ))
      )
    ).toBe(<div>2</div>);

    // Async renders SuspenseScript
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>1</div>}>
            {Promise.resolve(<div>2</div>)}
          </Suspense>
        ))
      )
    ).toBe(
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {safeSuspenseScript}

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
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>1</div>}>
            {Promise.resolve(<div>2</div>)}
          </Suspense>
        ))
      )
    ).toBe(
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

    expect(stream.readable).toBeTruthy();

    // emits end event
    const fn = vi.fn();
    stream.on('end', fn);

    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(fn.mock.calls.length).toBe(1);
    expect(chunks.length).toBe(2);

    expect(chunks[0].toString()).toBe(
      <div>
        <div id="B:1" data-sf>
          <div>2</div>
        </div>
      </div>
    );

    expect(chunks[1].toString()).toBe(
      <>
        {safeSuspenseScript}

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

    expect(stream.readable).toBeTruthy();

    const data = stream.read();

    expect(data.toString()).toBe('<div>not suspense</div>');

    expect(await text(stream)).toBe('');

    expect(stream.closed).toBeTruthy();
  });

  it('tests suspense without children', async () => {
    expect(
      await text(
        renderToStream((r) => (
          //@ts-expect-error - testing invalid children
          <Suspense rid={r} fallback={<div>1</div>}></Suspense>
        ))
      )
    ).toBe('');
  });

  it('works with async error handlers', async () => {
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>1</div>} catch={Promise.resolve(<div>2</div>)}>
            {Promise.reject(<div>3</div>)}
          </Suspense>
        ))
      )
    ).toBe(
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {safeSuspenseScript}

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
    expect(
      await text(
        renderToStream((rid) => {
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
        })
      )
    ).toBe(
      <>
        <div>
          <div id="B:2" data-sf>
            <div>1</div>
          </div>
        </div>

        {safeSuspenseScript}

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
    expect(
      await text(
        renderToStream((rid) => {
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
        })
      )
    ).toBe(
      <>
        <div>
          <div id="B:2" data-sf>
            <div>1</div>
          </div>
        </div>

        {safeSuspenseScript}

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
    const html = await text(
      renderToStream((rid) => (
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
      ))
    );

    expect(html).toBe(
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

    // tests with final html result
    expect(
      new JSDOM(html, { runScripts: 'dangerously' }).window.document.body.innerHTML
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

  it('SuspenseScript is a valid JS code', () => {
    // removes <script ...> and </script> tags
    eval(
      safeSuspenseScript.slice(safeSuspenseScript.indexOf('>') + 1, -'</script>'.length)
    );
  });

  it('Suspense works when children resolves first', async () => {
    async function Fallback() {
      for (let i = 0; i < 10; i++) {
        await setImmediate();
      }
      return 'Fallback!';
    }

    async function Child() {
      await setImmediate();
      return 'Child!';
    }

    const html = await text(
      renderToStream((rid) => (
        <div>
          <Suspense rid={rid} fallback={<Fallback />}>
            <Child />
          </Suspense>
        </div>
      ))
    );

    expect(html).toBe(
      <>
        <div>
          <div id="B:1" data-sf>
            Fallback!
          </div>
        </div>

        {safeSuspenseScript as 'safe'}

        <template id="N:1" data-sr>
          Child!
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );
  });

  it('Suspense fails when children rejects first', async () => {
    async function Fallback(): Promise<string> {
      for (let i = 0; i < 10; i++) {
        await setImmediate();
      }

      throw 'Fallback!';
    }

    async function Child(): Promise<string> {
      await setImmediate();
      return 'Child!';
    }

    try {
      await text(
        renderToStream((rid) => (
          <div>
            <Suspense rid={rid} fallback={<Fallback />}>
              <Child />
            </Suspense>
          </div>
        ))
      );

      throw new Error('should throw');
    } catch (error) {
      expect(error).toBe('Fallback!');
    }
  });
});

describe('Suspense errors', () => {
  it('Leaks if rendered outside of renderToStream', () => {
    try {
      const outside = (
        <Suspense rid={1} fallback={'1'}>
          {Promise.resolve(2)}
        </Suspense>
      );

      expect(outside).toBe(
        <div id="B:1" data-sf>
          1
        </div>
      );

      const requestData = SUSPENSE_ROOT.requests.get(1);

      expect(requestData?.running).toBe(1);
      expect(requestData?.sent).toBe(false);
    } finally {
      expect(SUSPENSE_ROOT.requests.has(1)).toBeTruthy();

      // cleans up
      SUSPENSE_ROOT.requests.delete(1);
    }
  });

  it('tests sync errors are thrown', async () => {
    await expect(
      text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>fallback</div>}>
            <Throw />
          </Suspense>
        ))
      )
    ).rejects.toThrow(/test/);
  });

  it('test sync errors after suspense', async () => {
    try {
      await text(
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
        ))
      );

      throw new Error('should throw');
    } catch (error: any) {
      expect(error.message).toBe('test');
    }
  });

  it('tests suspense without error boundary', async () => {
    const err = new Error('component failed');

    try {
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>1</div>}>
            {Promise.reject(err)}
          </Suspense>
        ))
      );

      throw new Error('should throw');
    } catch (error) {
      expect(error).toBe(err);
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
        expect(data.toString()).toBe(
          <div id="B:1" data-sf>
            <div>1</div>
          </div>
        );
      }

      throw new Error('should throw');
    } catch (error) {
      expect(error).toBe(err);
    }
  });

  it('tests suspense with function error boundary', async () => {
    const err = new Error('component failed');

    // Sync does not needs autoScript
    expect(
      await text(
        renderToStream((r) => (
          <Suspense
            rid={r}
            fallback={<div>1</div>}
            catch={(err2) => {
              expect(err2).toBe(err);

              return <div>3</div>;
            }}
          >
            {Promise.reject(err)}
          </Suspense>
        ))
      )
    ).toBe(
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

  it('throws when rid is not provided', async () => {
    await expect(
      text(
        renderToStream(() => (
          //@ts-expect-error
          <Suspense fallback={<div>1</div>}>{Promise.resolve('123')}</Suspense>
        ))
      )
    ).rejects.toThrow(/Suspense requires a `rid` to be specified./);
  });

  it('tests suspense with error boundary', async () => {
    const err = new Error('component failed');

    // Sync does not needs autoScript
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>1</div>} catch={<div>3</div>}>
            {Promise.reject(err)}
          </Suspense>
        ))
      )
    ).toBe(
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

    expect(firstChunk.toString()).toBe(
      <div id="B:1" data-sf>
        <div>1</div>
      </div>
    );

    // In case any .push() is called after the stream is closed,
    // The error below would be thrown:
    // Error [ERR_STREAM_PUSH_AFTER_EOF]: stream.push() after EOF

    expect(await text(rendered)).toBe('');
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

    await expect(text(renderToStream(render, 1))).rejects.toThrow(
      /The provided Request Id is already in use: 1./
    );

    const html = await text(stream);

    expect(html).toBe(
      <>
        <div id="B:1" data-sf>
          <div>1</div>
        </div>

        {safeSuspenseScript}

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
      await text(stream);

      throw new Error('should throw');
    } catch (error: any) {
      expect(error.message).toBe('Factory error');
    }
  });
});
