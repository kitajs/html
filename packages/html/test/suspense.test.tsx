import { JSDOM } from 'jsdom';
import { text } from 'node:stream/consumers';
import { setTimeout } from 'node:timers/promises';
import { afterEach, describe, expect, test, vi } from 'vitest';
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

describe('renderToStream', () => {
  test('without suspense - sync', async () => {
    expect(await text(renderToStream(() => <div />))).toBe(<div />);
  });

  test('without suspense - async', async () => {
    expect(await text(renderToStream(async () => <div />))).toBe(<div />);
  });

  test('with custom rid', async () => {
    const stream = renderToStream(() => '<div>custom</div>', 'my-custom-rid');
    expect(stream.readable).toBeTruthy();
    expect(await text(stream)).toBe('<div>custom</div>');
  });

  test('with string rid', async () => {
    expect(
      await text(
        renderToStream(
          (r) => (
            <Suspense rid={r} fallback={<div>loading</div>}>
              {Promise.resolve(<div>loaded</div>)}
            </Suspense>
          ),
          'string-rid-123'
        )
      )
    ).toContain('<div>loaded</div>');
  });

  test('emits end event and chunks correctly', async () => {
    const stream = renderToStream((r) => (
      <div>
        <Suspense rid={r} fallback={<div>fallback</div>}>
          {Promise.resolve(<div>resolved</div>)}
        </Suspense>
      </div>
    ));

    const fn = vi.fn();
    stream.on('end', fn);

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk.toString());
    }

    expect(fn).toHaveBeenCalledOnce();
    expect(chunks.length).toBe(2);
    expect(chunks[0]).toContain('data-sf');
    expect(chunks[1]).toContain('data-sr');
  });

  test('rejects duplicate rid', async () => {
    const stream = renderToStream(
      (r) => (
        <Suspense rid={r} fallback="1">
          {Promise.resolve('2')}
        </Suspense>
      ),
      1
    );

    await expect(
      text(
        renderToStream(
          (r) => (
            <Suspense rid={r} fallback="1">
              {Promise.resolve('2')}
            </Suspense>
          ),
          1
        )
      )
    ).rejects.toThrow(/The provided Request Id is already in use: 1./);

    await text(stream); // consume to cleanup
  });

  test('emits error if factory throws', async () => {
    const stream = renderToStream(async () => {
      throw new Error('Factory error');
    });

    await expect(text(stream)).rejects.toThrow('Factory error');
  });
});

describe('Suspense - basic rendering', () => {
  test('sync children returns content directly (no wrapper)', async () => {
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>fallback</div>}>
            <div>sync content</div>
          </Suspense>
        ))
      )
    ).toBe(<div>sync content</div>);
  });

  test('async children renders fallback then streams content', async () => {
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>loading</div>}>
            <SleepForMs ms={1} />
          </Suspense>
        ))
      )
    ).toBe(
      <>
        <div id="B:1" data-sf>
          <div>loading</div>
        </div>
        {safeSuspenseScript}
        <template id="N:1" data-sr>
          1
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
      </>
    );
  });

  test('async fallback with sync children returns content directly', async () => {
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={Promise.resolve(<div>async fallback</div>)}>
            <div>sync content</div>
          </Suspense>
        ))
      )
    ).toBe(<div>sync content</div>);
  });

  test('empty children', async () => {
    expect(
      await text(
        renderToStream((r) => (
          //@ts-expect-error - testing empty children
          <Suspense rid={r} fallback={<div>fallback</div>}></Suspense>
        ))
      )
    ).toBe('');
  });

  test('null children', async () => {
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>fallback</div>}>
            {null}
          </Suspense>
        ))
      )
    ).toBe('');
  });

  test('immediately resolving promise', async () => {
    expect(
      await text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>loading</div>}>
            {Promise.resolve(<div>instant</div>)}
          </Suspense>
        ))
      )
    ).toContain('<div>instant</div>');
  });
});

describe('Suspense - autoScript', () => {
  test('includes SuspenseScript automatically for first async suspense', async () => {
    const result = await text(
      renderToStream((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          {Promise.resolve(<div>2</div>)}
        </Suspense>
      ))
    );

    expect(result).toContain('id="kita-html-suspense"');
    expect(result).toContain('$KITA_RC');
  });

  test('can disable autoScript', async () => {
    SUSPENSE_ROOT.autoScript = false;

    const result = await text(
      renderToStream((r) => (
        <Suspense rid={r} fallback={<div>1</div>}>
          {Promise.resolve(<div>2</div>)}
        </Suspense>
      ))
    );

    expect(result).not.toContain('id="kita-html-suspense"');
    expect(result).toContain('$KITA_RC(1)'); // still has the call
  });

  test('SuspenseScript is valid JavaScript', () => {
    const scriptContent = safeSuspenseScript.slice(
      safeSuspenseScript.indexOf('>') + 1,
      -'</script>'.length
    );
    expect(() => eval(scriptContent)).not.toThrow();
  });
});

describe('Suspense - multiple components', () => {
  test('multiple sibling suspense components', async () => {
    expect(
      await text(
        renderToStream((r) => (
          <div>
            <Suspense rid={r} fallback={<div>1</div>}>
              <SleepForMs ms={1} />
            </Suspense>
            <Suspense rid={r} fallback={<div>2</div>}>
              <SleepForMs ms={2} />
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
        </div>
        {safeSuspenseScript}
        <template id="N:1" data-sr>
          1
        </template>
        <script id="S:1" data-ss>
          $KITA_RC(1)
        </script>
        <template id="N:2" data-sr>
          2
        </template>
        <script id="S:2" data-ss>
          $KITA_RC(2)
        </script>
      </>
    );
  });

  test('mixed sync and async suspense components', async () => {
    const result = await text(
      renderToStream((r) => (
        <div>
          <Suspense rid={r} fallback={<div>sync-fallback</div>}>
            <div>sync-content</div>
          </Suspense>
          <Suspense rid={r} fallback={<div>async-fallback</div>}>
            {Promise.resolve(<div>async-content</div>)}
          </Suspense>
        </div>
      ))
    );

    // Sync content appears inline, async has wrapper
    expect(result).toContain('<div>sync-content</div>');
    expect(result).toContain('data-sf');
    expect(result).toContain('<div>async-content</div>');
  });

  test('concurrent renders with unique rids', async () => {
    const results = await Promise.all([
      text(
        renderToStream((r) => (
          <Suspense rid={r} fallback="a">
            <SleepForMs ms={2}>A</SleepForMs>
          </Suspense>
        ))
      ),
      text(
        renderToStream((r) => (
          <Suspense rid={r} fallback="b">
            <SleepForMs ms={1}>B</SleepForMs>
          </Suspense>
        ))
      )
    ]);

    expect(results[0]).toContain('A');
    expect(results[1]).toContain('B');
  });

  test('handles 100 concurrent renders without leaks', async () => {
    await Promise.all(
      Array.from({ length: 100 }, () =>
        text(
          renderToStream((r) => (
            <Suspense rid={r} fallback={<div>loading</div>}>
              <SleepForMs ms={1} />
            </Suspense>
          ))
        )
      )
    );
    // afterEach verifies no leaks
  });
});

describe('Suspense - nested', () => {
  test('nested suspense - inner resolves first', async () => {
    const html = await text(
      renderToStream((rid) => (
        <div>
          <Suspense rid={rid} fallback={<div>outer-loading</div>}>
            {setTimeout(
              20,
              <div>
                <Suspense rid={rid} fallback={<div>inner-loading</div>}>
                  {setTimeout(10, <div>inner-content</div>)}
                </Suspense>
              </div>
            )}
          </Suspense>
        </div>
      ))
    );

    // Inner resolves first, so N:1 appears before N:2
    expect(html.indexOf('N:1')).toBeLessThan(html.indexOf('N:2'));
    expect(html).toContain('inner-content');
  });

  test('nested suspense - outer resolves first', async () => {
    const html = await text(
      renderToStream((rid) => (
        <div>
          <Suspense rid={rid} fallback={<div>outer-loading</div>}>
            {setTimeout(
              10,
              <div>
                <Suspense rid={rid} fallback={<div>inner-loading</div>}>
                  {setTimeout(20, <div>inner-content</div>)}
                </Suspense>
              </div>
            )}
          </Suspense>
        </div>
      ))
    );

    expect(html).toContain('inner-content');
  });

  test('deeply nested parallel suspense with JSDOM validation', async () => {
    const html = await text(
      renderToStream((rid) => (
        <div>
          {Array.from({ length: 3 }, (_, i) => (
            <Suspense rid={rid} fallback={<div>{i} outer loading</div>}>
              <SleepForMs ms={i}>
                <div>Outer {i}</div>
                <Suspense rid={rid} fallback={<div>{i} inner loading</div>}>
                  <SleepForMs ms={i}>
                    <div>Inner {i}</div>
                  </SleepForMs>
                </Suspense>
              </SleepForMs>
            </Suspense>
          ))}
        </div>
      ))
    );

    // Validate final DOM structure after script execution
    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    const body = dom.window.document.body.innerHTML;

    expect(body).toContain('<div>Outer 0</div>');
    expect(body).toContain('<div>Inner 0</div>');
    expect(body).toContain('<div>Outer 2</div>');
    expect(body).toContain('<div>Inner 2</div>');
  });
});

describe('Suspense - error handling', () => {
  test('throws when rid is not provided', async () => {
    await expect(
      text(
        renderToStream(() => (
          //@ts-expect-error - testing missing rid
          <Suspense fallback={<div>1</div>}>{Promise.resolve('test')}</Suspense>
        ))
      )
    ).rejects.toThrow(/Suspense requires a `rid` to be specified./);
  });

  test('sync error in children propagates', async () => {
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

  test('async error without catch handler propagates', async () => {
    const err = new Error('async error');

    await expect(
      text(
        renderToStream((r) => (
          <Suspense rid={r} fallback={<div>loading</div>}>
            {Promise.reject(err)}
          </Suspense>
        ))
      )
    ).rejects.toBe(err);
  });

  test('catch handler as JSX element', async () => {
    const result = await text(
      renderToStream((r) => (
        <Suspense rid={r} fallback={<div>loading</div>} catch={<div>error occurred</div>}>
          {Promise.reject(new Error('fail'))}
        </Suspense>
      ))
    );

    expect(result).toContain('<div>error occurred</div>');
  });

  test('catch handler as function receives error', async () => {
    const err = new Error('specific error');

    const result = await text(
      renderToStream((r) => (
        <Suspense
          rid={r}
          fallback={<div>loading</div>}
          catch={(e) => {
            expect(e).toBe(err);
            return <div>caught: {(e as Error).message}</div>;
          }}
        >
          {Promise.reject(err)}
        </Suspense>
      ))
    );

    expect(result).toContain('caught: specific error');
  });

  test('async catch handler', async () => {
    const result = await text(
      renderToStream((r) => (
        <Suspense
          rid={r}
          fallback={<div>loading</div>}
          catch={Promise.resolve(<div>async error handler</div>)}
        >
          {Promise.reject(new Error('fail'))}
        </Suspense>
      ))
    );

    expect(result).toContain('<div>async error handler</div>');
  });

  test('error in sync children after suspense registration', async () => {
    await expect(
      text(
        renderToStream((r) => (
          <div>
            <Suspense rid={r} fallback={<div>fallback</div>}>
              {setTimeout(50).then(() => (
                <div>1</div>
              ))}
            </Suspense>
            <Throw />
          </div>
        ))
      )
    ).rejects.toThrow('test');
  });
});
