import { JSDOM } from 'jsdom';
import assert from 'node:assert';
import { text } from 'node:stream/consumers';
import { afterEach, describe, it, test } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import { Generator, renderToStream, SuspenseScript } from '../suspense';

// Detect leaks of pending promises
afterEach(() => {
  assert.equal(SUSPENSE_ROOT.requests.size, 0, 'Suspense root left pending requests');

  // Reset suspense root
  SUSPENSE_ROOT.autoScript = true;
  SUSPENSE_ROOT.requestCounter = 1;
  SUSPENSE_ROOT.requests.clear();
});

async function* generateDataAsync(n: number, delay = 25) {
  for (let i = 0; i < n; i++) {
    yield { i };
    await setTimeout(delay);
  }
}
generateDataAsync.data = true;
generateDataAsync.async = true;

async function* generateHtmlAsync(n: number, delay = 25) {
  for (let i = 0; i < n; i++) {
    yield <Component i={i} />;
    await setTimeout(delay);
  }

  return 123;
}
generateHtmlAsync.data = false;
generateHtmlAsync.async = true;

function* generateData(n: number) {
  for (let i = 0; i < n; i++) {
    yield { i };
  }
}
generateData.data = true;
generateData.async = false;

function* generateHtml(n: number) {
  for (let i = 0; i < n; i++) {
    yield <Component i={i} />;
  }
}
generateHtml.data = false;
generateHtml.async = false;

function Component({ i }: { i: number }) {
  return <div>{i}</div>;
}

describe('Generator', () => {
  for (const fn of [generateHtml, generateData, generateHtmlAsync, generateDataAsync]) {
    test(`Simple ${fn.name}() usage`, async () => {
      const source = fn(5);

      const component = renderToStream((r) => (
        <Generator rid={r} source={source as any} map={fn.data ? Component : undefined} />
      ));

      const html = await text(component);

      assert.equal(
        html,
        <>
          <div id="B:1" data-sf />

          {SuspenseScript}

          <template id="N:1" data-sr>
            <div>0</div>
          </template>
          <script id="S:1" data-ss>
            $KITA_RC(1,1)
          </script>
          <template id="N:1" data-sr>
            <div>1</div>
          </template>
          <script id="S:1" data-ss>
            $KITA_RC(1,1)
          </script>
          <template id="N:1" data-sr>
            <div>2</div>
          </template>
          <script id="S:1" data-ss>
            $KITA_RC(1,1)
          </script>
          <template id="N:1" data-sr>
            <div>3</div>
          </template>
          <script id="S:1" data-ss>
            $KITA_RC(1,1)
          </script>
          <template id="N:1" data-sr>
            <div>4</div>
          </template>
          <script id="S:1" data-ss>
            $KITA_RC(1,1)
          </script>

          {/* last item to close */}
          <script id="S:1" data-ss>
            $KITA_RC(1,2)
          </script>
        </>
      );

      assert.equal(
        new JSDOM(html, { runScripts: 'dangerously' }).window.document.body.innerHTML,
        <>
          <div>0</div>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          {SuspenseScript}
        </>
      );
    });

    if (fn.async) {
      test(`Concurrent ${fn.name}() usage`, async () => {
        const data = [2, 4, 3, 1, 5];

        const component = renderToStream((r) => (
          <>
            {data
              .map((i) => fn(i * 2, (5 - i) * 100))
              .map((source, i) => (
                <div title={i.toString()}>
                  <Generator
                    rid={r}
                    source={source as any}
                    map={fn.data ? Component : undefined}
                  />
                </div>
              ))}
          </>
        ));

        const html = await text(component);

        assert.equal(
          html,
          <>
            <div title="0">
              <div id="B:1" data-sf></div>
            </div>
            <div title="1">
              <div id="B:2" data-sf></div>
            </div>
            <div title="2">
              <div id="B:3" data-sf></div>
            </div>
            <div title="3">
              <div id="B:4" data-sf></div>
            </div>
            <div title="4">
              <div id="B:5" data-sf></div>
            </div>

            {SuspenseScript}

            <>
              <template id="N:1" data-sr>
                <div>0</div>
              </template>
              <script id="S:1" data-ss>
                $KITA_RC(1,1)
              </script>
              <template id="N:2" data-sr>
                <div>0</div>
              </template>
              <script id="S:2" data-ss>
                $KITA_RC(2,1)
              </script>
              <template id="N:3" data-sr>
                <div>0</div>
              </template>
              <script id="S:3" data-ss>
                $KITA_RC(3,1)
              </script>
              <template id="N:4" data-sr>
                <div>0</div>
              </template>
              <script id="S:4" data-ss>
                $KITA_RC(4,1)
              </script>
              <template id="N:5" data-sr>
                <div>0</div>
              </template>
              <script id="S:5" data-ss>
                $KITA_RC(5,1)
              </script>
              <template id="N:5" data-sr>
                <div>1</div>
              </template>
              <script id="S:5" data-ss>
                $KITA_RC(5,1)
              </script>
              <template id="N:5" data-sr>
                <div>2</div>
              </template>
              <script id="S:5" data-ss>
                $KITA_RC(5,1)
              </script>
              <template id="N:5" data-sr>
                <div>3</div>
              </template>
              <script id="S:5" data-ss>
                $KITA_RC(5,1)
              </script>
              <template id="N:5" data-sr>
                <div>4</div>
              </template>
              <script id="S:5" data-ss>
                $KITA_RC(5,1)
              </script>
              <template id="N:5" data-sr>
                <div>5</div>
              </template>
              <script id="S:5" data-ss>
                $KITA_RC(5,1)
              </script>
              <template id="N:5" data-sr>
                <div>6</div>
              </template>
              <script id="S:5" data-ss>
                $KITA_RC(5,1)
              </script>
              <template id="N:5" data-sr>
                <div>7</div>
              </template>
              <script id="S:5" data-ss>
                $KITA_RC(5,1)
              </script>
              <template id="N:5" data-sr>
                <div>8</div>
              </template>
              <script id="S:5" data-ss>
                $KITA_RC(5,1)
              </script>
              <template id="N:5" data-sr>
                <div>9</div>
              </template>
              <script id="S:5" data-ss>
                $KITA_RC(5,1)
              </script>
              <script id="S:5" data-ss>
                $KITA_RC(5,2)
              </script>
              <template id="N:2" data-sr>
                <div>1</div>
              </template>
              <script id="S:2" data-ss>
                $KITA_RC(2,1)
              </script>
              <template id="N:3" data-sr>
                <div>1</div>
              </template>
              <script id="S:3" data-ss>
                $KITA_RC(3,1)
              </script>
              <template id="N:2" data-sr>
                <div>2</div>
              </template>
              <script id="S:2" data-ss>
                $KITA_RC(2,1)
              </script>
              <template id="N:1" data-sr>
                <div>1</div>
              </template>
              <script id="S:1" data-ss>
                $KITA_RC(1,1)
              </script>
              <template id="N:2" data-sr>
                <div>3</div>
              </template>
              <script id="S:2" data-ss>
                $KITA_RC(2,1)
              </script>
              <template id="N:4" data-sr>
                <div>1</div>
              </template>
              <script id="S:4" data-ss>
                $KITA_RC(4,1)
              </script>
              <template id="N:3" data-sr>
                <div>2</div>
              </template>
              <script id="S:3" data-ss>
                $KITA_RC(3,1)
              </script>
              <template id="N:2" data-sr>
                <div>4</div>
              </template>
              <script id="S:2" data-ss>
                $KITA_RC(2,1)
              </script>
              <template id="N:2" data-sr>
                <div>5</div>
              </template>
              <script id="S:2" data-ss>
                $KITA_RC(2,1)
              </script>
              <template id="N:1" data-sr>
                <div>2</div>
              </template>
              <script id="S:1" data-ss>
                $KITA_RC(1,1)
              </script>
              <template id="N:3" data-sr>
                <div>3</div>
              </template>
              <script id="S:3" data-ss>
                $KITA_RC(3,1)
              </script>
              <template id="N:2" data-sr>
                <div>6</div>
              </template>
              <script id="S:2" data-ss>
                $KITA_RC(2,1)
              </script>
              <template id="N:2" data-sr>
                <div>7</div>
              </template>
              <script id="S:2" data-ss>
                $KITA_RC(2,1)
              </script>
              <script id="S:4" data-ss>
                $KITA_RC(4,2)
              </script>
              <template id="N:3" data-sr>
                <div>4</div>
              </template>
              <script id="S:3" data-ss>
                $KITA_RC(3,1)
              </script>
              <script id="S:2" data-ss>
                $KITA_RC(2,2)
              </script>
              <template id="N:1" data-sr>
                <div>3</div>
              </template>
              <script id="S:1" data-ss>
                $KITA_RC(1,1)
              </script>
              <template id="N:3" data-sr>
                <div>5</div>
              </template>
              <script id="S:3" data-ss>
                $KITA_RC(3,1)
              </script>
              <script id="S:1" data-ss>
                $KITA_RC(1,2)
              </script>
              <script id="S:3" data-ss>
                $KITA_RC(3,2)
              </script>
            </>
          </>
        );

        assert.equal(
          new JSDOM(html, { runScripts: 'dangerously' }).window.document.body.innerHTML,
          <>
            <div title="0">
              <div>0</div>
              <div>1</div>
              <div>2</div>
              <div>{data[0]! * 2 - 1}</div>
            </div>

            <div title="1">
              <div>0</div>
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
              <div>5</div>
              <div>6</div>
              <div>{data[1]! * 2 - 1}</div>
            </div>

            <div title="2">
              <div>0</div>
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
              <div>{data[2]! * 2 - 1}</div>
            </div>

            <div title="3">
              <div>0</div>
              <div>{data[3]! * 2 - 1}</div>
            </div>

            <div title="4">
              <div>0</div>
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
              <div>5</div>
              <div>6</div>
              <div>7</div>
              <div>8</div>
              <div>{data[4]! * 2 - 1}</div>
            </div>

            {SuspenseScript}
          </>
        );
      });
    }
  }

  // test('Suspense sync children', async () => {
  //   assert.equal(
  //     await text(
  //       renderToStream((r) => (
  //         <Suspense rid={r} fallback={<div>1</div>}>
  //           <div>2</div>
  //         </Suspense>
  //       ))
  //     ),
  //     <div>2</div>
  //   );
  // });

  // test('Suspense async children', async () => {
  //   assert.equal(
  //     await text(
  //       renderToStream((r) => (
  //         <Suspense rid={r} fallback={<div>1</div>}>
  //           <SleepForMs ms={2} />
  //         </Suspense>
  //       ))
  //     ),
  //     <>
  //       <div id="B:1" data-sf>
  //         <div>1</div>
  //       </div>

  //       {SuspenseScript}

  //       <template id="N:1" data-sr>
  //         2
  //       </template>
  //       <script id="S:1" data-ss>
  //         $KITA_RC(1)
  //       </script>
  //     </>
  //   );
  // });

  // test('Suspense async children & fallback', async () => {
  //   assert.equal(
  //     await text(
  //       renderToStream((r) => (
  //         <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
  //           <SleepForMs ms={2} />
  //         </Suspense>
  //       ))
  //     ),
  //     <>
  //       <div id="B:1" data-sf>
  //         <div>1</div>
  //       </div>

  //       {SuspenseScript}

  //       <template id="N:1" data-sr>
  //         2
  //       </template>
  //       <script id="S:1" data-ss>
  //         $KITA_RC(1)
  //       </script>
  //     </>
  //   );
  // });

  // test('Suspense async fallback sync children', async () => {
  //   assert.equal(
  //     await text(
  //       renderToStream((r) => (
  //         <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
  //           <div>2</div>
  //         </Suspense>
  //       ))
  //     ),
  //     <>
  //       <div>2</div>
  //     </>
  //   );
  // });

  // test('Multiple async renders cleanup', async () => {
  //   await Promise.all(
  //     Array.from({ length: 100 }, () => {
  //       return text(
  //         renderToStream((r) => {
  //           return (
  //             <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
  //               <SleepForMs ms={2} />
  //             </Suspense>
  //           );
  //         })
  //       ).then((res) => {
  //         assert.equal(
  //           res,
  //           <>
  //             <div id="B:1" data-sf>
  //               <div>1</div>
  //             </div>

  //             {SuspenseScript}

  //             <template id="N:1" data-sr>
  //               2
  //             </template>
  //             <script id="S:1" data-ss>
  //               $KITA_RC(1)
  //             </script>
  //           </>
  //         );
  //       });
  //     })
  //   );
  // });

  // test('Multiple sync renders cleanup', async () => {
  //   for (let i = 0; i < 10; i++) {
  //     assert.equal(
  //       await text(
  //         renderToStream((r) => (
  //           <Suspense rid={r} fallback={Promise.resolve(<div>1</div>)}>
  //             <SleepForMs ms={2} />
  //           </Suspense>
  //         ))
  //       ),
  //       <>
  //         <div id="B:1" data-sf>
  //           <div>1</div>
  //         </div>

  //         {SuspenseScript}

  //         <template id="N:1" data-sr>
  //           2
  //         </template>
  //         <script id="S:1" data-ss>
  //           $KITA_RC(1)
  //         </script>
  //       </>
  //     );
  //   }
  // });

  // test('Multiple children', async () => {
  //   assert.equal(
  //     await text(
  //       renderToStream((r) => (
  //         <div>
  //           <Suspense rid={r} fallback={<div>1</div>}>
  //             <SleepForMs ms={4} />
  //           </Suspense>

  //           <Suspense rid={r} fallback={<div>2</div>}>
  //             <SleepForMs ms={5} />
  //           </Suspense>

  //           <Suspense rid={r} fallback={<div>3</div>}>
  //             <SleepForMs ms={6} />
  //           </Suspense>
  //         </div>
  //       ))
  //     ),
  //     <>
  //       <div>
  //         <div id="B:1" data-sf>
  //           <div>1</div>
  //         </div>
  //         <div id="B:2" data-sf>
  //           <div>2</div>
  //         </div>
  //         <div id="B:3" data-sf>
  //           <div>3</div>
  //         </div>
  //       </div>

  //       {SuspenseScript}

  //       <template id="N:1" data-sr>
  //         4
  //       </template>
  //       <script id="S:1" data-ss>
  //         $KITA_RC(1)
  //       </script>

  //       <template id="N:2" data-sr>
  //         5
  //       </template>
  //       <script id="S:2" data-ss>
  //         $KITA_RC(2)
  //       </script>

  //       <template id="N:3" data-sr>
  //         6
  //       </template>
  //       <script id="S:3" data-ss>
  //         $KITA_RC(3)
  //       </script>
  //     </>
  //   );
  // });

  // test('Concurrent renders', async () => {
  //   const promises = [];

  //   for (const seconds of [9, 4, 7]) {
  //     const length = promises.push(
  //       text(
  //         renderToStream((r) => (
  //           <div>
  //             {Array.from({ length: seconds }, (_, i) => (
  //               <Suspense rid={r} fallback={<div>{seconds - i} loading</div>}>
  //                 <SleepForMs ms={seconds - i}>{seconds - i}</SleepForMs>
  //               </Suspense>
  //             ))}
  //           </div>
  //         ))
  //       )
  //     );

  //     //@ts-expect-error - testing invalid promises
  //     promises[length - 1]!.seconds = seconds;
  //   }

  //   const results = await Promise.all(promises);

  //   for (const [index, result] of results.entries()) {
  //     //@ts-expect-error - testing invalid promises
  //     const seconds = +promises[index]!.seconds;

  //     assert.strictEqual(
  //       result,
  //       <>
  //         <div>
  //           {Array.from({ length: seconds }, (_, i) => (
  //             <div id={`B:${i + 1}`} data-sf>
  //               <div>{seconds - i} loading</div>
  //             </div>
  //           ))}
  //         </div>

  //         {SuspenseScript}

  //         {Array.from({ length: seconds }, (_, i) => (
  //           <>
  //             <template id={`N:${seconds - i}`} data-sr>
  //               {i + 1}
  //             </template>
  //             <script id={`S:${seconds - i}`} data-ss>
  //               $KITA_RC({seconds - i})
  //             </script>
  //           </>
  //         ))}
  //       </>
  //     );
  //   }
  // });

  // it('ensures autoScript works', async () => {
  //   // Sync does not needs autoScript
  //   assert.equal(
  //     await text(
  //       renderToStream((r) => (
  //         <Suspense rid={r} fallback={<div>1</div>}>
  //           <div>2</div>
  //         </Suspense>
  //       ))
  //     ),
  //     <div>2</div>
  //   );

  //   // Async renders SuspenseScript
  //   assert.equal(
  //     await text(
  //       renderToStream((r) => (
  //         <Suspense rid={r} fallback={<div>1</div>}>
  //           {Promise.resolve(<div>2</div>)}
  //         </Suspense>
  //       ))
  //     ),
  //     <>
  //       <div id="B:1" data-sf>
  //         <div>1</div>
  //       </div>

  //       {SuspenseScript}

  //       <template id="N:1" data-sr>
  //         <div>2</div>
  //       </template>
  //       <script id="S:1" data-ss>
  //         $KITA_RC(1)
  //       </script>
  //     </>
  //   );

  //   // Disable autoScript
  //   SUSPENSE_ROOT.autoScript = false;

  //   // Async renders SuspenseScript
  //   assert.equal(
  //     await text(
  //       renderToStream((r) => (
  //         <Suspense rid={r} fallback={<div>1</div>}>
  //           {Promise.resolve(<div>2</div>)}
  //         </Suspense>
  //       ))
  //     ),
  //     <>
  //       <div id="B:1" data-sf>
  //         <div>1</div>
  //       </div>
  //       <template id="N:1" data-sr>
  //         <div>2</div>
  //       </template>
  //       <script id="S:1" data-ss>
  //         $KITA_RC(1)
  //       </script>
  //     </>
  //   );
  // });

  // test('renderToStream', async () => {
  //   const stream = renderToStream((r) => (
  //     <div>
  //       <Suspense rid={r} fallback={<div>2</div>}>
  //         {Promise.resolve(<div>1</div>)}
  //       </Suspense>
  //     </div>
  //   ));

  //   assert(stream.readable);

  //   // emits end event
  //   const fn = mock.fn();
  //   stream.on('end', fn);

  //   const chunks = [];

  //   for await (const chunk of stream) {
  //     chunks.push(chunk);
  //   }

  //   assert.equal(fn.mock.calls.length, 1);
  //   assert.equal(chunks.length, 2);

  //   assert.equal(
  //     chunks[0].toString(),
  //     <div>
  //       <div id="B:1" data-sf>
  //         <div>2</div>
  //       </div>
  //     </div>
  //   );

  //   assert.equal(
  //     chunks[1].toString(),
  //     <>
  //       {SuspenseScript}

  //       <template id="N:1" data-sr>
  //         <div>1</div>
  //       </template>
  //       <script id="S:1" data-ss>
  //         $KITA_RC(1)
  //       </script>
  //     </>
  //   );
  // });

  // test('renderToStream without suspense', async () => {
  //   const stream = renderToStream(() => '<div>not suspense</div>', 1227);

  //   assert.ok(stream.readable);

  //   const data = stream.read();

  //   assert.equal(data.toString(), '<div>not suspense</div>');

  //   assert.equal(await text(stream), '');

  //   assert.ok(stream.closed);
  // });

  // it('tests suspense without children', async () => {
  //   assert.equal(
  //     await text(
  //       renderToStream((r) => (
  //         //@ts-expect-error - testing invalid children
  //         <Suspense rid={r} fallback={<div>1</div>}></Suspense>
  //       ))
  //     ),
  //     ''
  //   );
  // });

  // it('works with async error handlers', async () => {
  //   assert.equal(
  //     await text(
  //       renderToStream((r) => (
  //         <Suspense rid={r} fallback={<div>1</div>} catch={Promise.resolve(<div>2</div>)}>
  //           {Promise.reject(<div>3</div>)}
  //         </Suspense>
  //       ))
  //     ),

  //     <>
  //       <div id="B:1" data-sf>
  //         <div>1</div>
  //       </div>

  //       {SuspenseScript}

  //       <template id="N:1" data-sr>
  //         <div>2</div>
  //       </template>
  //       <script id="S:1" data-ss>
  //         $KITA_RC(1)
  //       </script>
  //     </>
  //   );
  // });

  // it('works with deep suspense calls', async () => {
  //   assert.equal(
  //     await text(
  //       renderToStream((rid) => {
  //         return (
  //           <div>
  //             <Suspense rid={rid} fallback={<div>1</div>}>
  //               <div>2</div>

  //               {setTimeout(10, <div>3</div>)}

  //               {setTimeout(
  //                 15,
  //                 <div>
  //                   <Suspense rid={rid} fallback={<div>4</div>}>
  //                     <div>5</div>

  //                     {setTimeout(20, <div>6</div>)}
  //                   </Suspense>
  //                 </div>
  //               )}
  //             </Suspense>
  //           </div>
  //         );
  //       })
  //     ),
  //     <>
  //       <div>
  //         <div id="B:2" data-sf>
  //           <div>1</div>
  //         </div>
  //       </div>

  //       {SuspenseScript}

  //       <template id="N:2" data-sr>
  //         <div>2</div>
  //         <div>3</div>
  //         <div>
  //           <div id="B:1" data-sf>
  //             <div>4</div>
  //           </div>
  //         </div>
  //       </template>
  //       <script id="S:2" data-ss>
  //         $KITA_RC(2)
  //       </script>

  //       <template id="N:1" data-sr>
  //         <div>5</div>
  //         <div>6</div>
  //       </template>
  //       <script id="S:1" data-ss>
  //         $KITA_RC(1)
  //       </script>
  //     </>
  //   );
  // });

  // it('works with deep suspense calls resolving first', async () => {
  //   assert.equal(
  //     await text(
  //       renderToStream((rid) => {
  //         return (
  //           <div>
  //             <Suspense rid={rid} fallback={<div>1</div>}>
  //               <div>2</div>

  //               {setTimeout(20, <div>3</div>)}

  //               {setTimeout(
  //                 15,
  //                 <div>
  //                   <Suspense rid={rid} fallback={<div>4</div>}>
  //                     <div>5</div>

  //                     {setTimeout(10, <div>6</div>)}
  //                   </Suspense>
  //                 </div>
  //               )}
  //             </Suspense>
  //           </div>
  //         );
  //       })
  //     ),
  //     <>
  //       <div>
  //         <div id="B:2" data-sf>
  //           <div>1</div>
  //         </div>
  //       </div>

  //       {SuspenseScript}

  //       <template id="N:1" data-sr>
  //         <div>5</div>
  //         <div>6</div>
  //       </template>

  //       <script id="S:1" data-ss>
  //         $KITA_RC(1)
  //       </script>

  //       <template id="N:2" data-sr>
  //         <div>2</div>
  //         <div>3</div>
  //         <div>
  //           <div id="B:1" data-sf>
  //             <div>4</div>
  //           </div>
  //         </div>
  //       </template>

  //       <script id="S:2" data-ss>
  //         $KITA_RC(2)
  //       </script>
  //     </>
  //   );
  // });

  // it('works with parallel deep suspense calls resolving first', async () => {
  //   const html = await text(
  //     renderToStream((rid) => (
  //       <div>
  //         {Array.from({ length: 5 }, (_, i) => (
  //           <Suspense rid={rid} fallback={<div>{i} fb outer</div>}>
  //             <div>Outer {i}!</div>

  //             <SleepForMs ms={i % 2 === 0 ? i / 2 : i}>
  //               <Suspense rid={rid} fallback={<div>{i} fb inner!</div>}>
  //                 <SleepForMs ms={i}>
  //                   <div>Inner {i}!</div>
  //                 </SleepForMs>
  //               </Suspense>
  //             </SleepForMs>
  //           </Suspense>
  //         ))}
  //       </div>
  //     ))
  //   );

  //   assert.equal(
  //     html,
  //     <>
  //       <div>
  //         <div id="B:2" data-sf>
  //           <div>0 fb outer</div>
  //         </div>
  //         <div id="B:4" data-sf>
  //           <div>1 fb outer</div>
  //         </div>
  //         <div id="B:6" data-sf>
  //           <div>2 fb outer</div>
  //         </div>
  //         <div id="B:8" data-sf>
  //           <div>3 fb outer</div>
  //         </div>
  //         <div id="B:10" data-sf>
  //           <div>4 fb outer</div>
  //         </div>
  //       </div>

  //       {SuspenseScript}

  //       <template id="N:1" data-sr>
  //         <div>Inner 0!</div>
  //       </template>
  //       <script id="S:1" data-ss>
  //         $KITA_RC(1)
  //       </script>

  //       <template id="N:2" data-sr>
  //         <div>Outer 0!</div>
  //         <div id="B:1" data-sf>
  //           <div>0 fb inner!</div>
  //         </div>
  //       </template>
  //       <script id="S:2" data-ss>
  //         $KITA_RC(2)
  //       </script>

  //       <template id="N:3" data-sr>
  //         <div>Inner 1!</div>
  //       </template>
  //       <script id="S:3" data-ss>
  //         $KITA_RC(3)
  //       </script>

  //       <template id="N:4" data-sr>
  //         <div>Outer 1!</div>
  //         <div id="B:3" data-sf>
  //           <div>1 fb inner!</div>
  //         </div>
  //       </template>
  //       <script id="S:4" data-ss>
  //         $KITA_RC(4)
  //       </script>

  //       <template id="N:6" data-sr>
  //         <div>Outer 2!</div>
  //         <div id="B:5" data-sf>
  //           <div>2 fb inner!</div>
  //         </div>
  //       </template>
  //       <script id="S:6" data-ss>
  //         $KITA_RC(6)
  //       </script>

  //       <template id="N:5" data-sr>
  //         <div>Inner 2!</div>
  //       </template>
  //       <script id="S:5" data-ss>
  //         $KITA_RC(5)
  //       </script>

  //       <template id="N:10" data-sr>
  //         <div>Outer 4!</div>
  //         <div id="B:9" data-sf>
  //           <div>4 fb inner!</div>
  //         </div>
  //       </template>
  //       <script id="S:10" data-ss>
  //         $KITA_RC(10)
  //       </script>

  //       <template id="N:7" data-sr>
  //         <div>Inner 3!</div>
  //       </template>
  //       <script id="S:7" data-ss>
  //         $KITA_RC(7)
  //       </script>

  //       <template id="N:8" data-sr>
  //         <div>Outer 3!</div>
  //         <div id="B:7" data-sf>
  //           <div>3 fb inner!</div>
  //         </div>
  //       </template>
  //       <script id="S:8" data-ss>
  //         $KITA_RC(8)
  //       </script>

  //       <template id="N:9" data-sr>
  //         <div>Inner 4!</div>
  //       </template>
  //       <script id="S:9" data-ss>
  //         $KITA_RC(9)
  //       </script>
  //     </>
  //   );

  //   // tests with final html result
  //   assert.equal(
  //     new JSDOM(html, { runScripts: 'dangerously' }).window.document.body.innerHTML,
  //     <>
  //       <div>
  //         <div>Outer 0!</div>
  //         <div>Inner 0!</div>
  //         <div>Outer 1!</div>
  //         <div>Inner 1!</div>
  //         <div>Outer 2!</div>
  //         <div>Inner 2!</div>
  //         <div>Outer 3!</div>
  //         <div>Inner 3!</div>
  //         <div>Outer 4!</div>
  //         <div>Inner 4!</div>
  //       </div>
  //       {SuspenseScript}
  //     </>
  //   );
  // });

  // it('SuspenseScript is a valid JS code', () => {
  //   // removes <script ...> and </script> tags
  //   eval(SuspenseScript.slice(SuspenseScript.indexOf('>') + 1, -'</script>'.length));
  // });

  // it('Suspense works when children resolves first', async () => {
  //   async function Fallback() {
  //     for (let i = 0; i < 10; i++) {
  //       await setImmediate();
  //     }
  //     return 'Fallback!';
  //   }

  //   async function Child() {
  //     await setImmediate();
  //     return 'Child!';
  //   }

  //   const html = await text(
  //     renderToStream((rid) => (
  //       <div>
  //         <Suspense rid={rid} fallback={<Fallback />}>
  //           <Child />
  //         </Suspense>
  //       </div>
  //     ))
  //   );

  //   assert.equal(
  //     html,
  //     <>
  //       <div>
  //         <div id="B:1" data-sf>
  //           Fallback!
  //         </div>
  //       </div>

  //       {SuspenseScript as 'safe'}

  //       <template id="N:1" data-sr>
  //         Child!
  //       </template>
  //       <script id="S:1" data-ss>
  //         $KITA_RC(1)
  //       </script>
  //     </>
  //   );
  // });

  // it('Suspense fails when children rejects first', async () => {
  //   async function Fallback(): Promise<string> {
  //     for (let i = 0; i < 10; i++) {
  //       await setImmediate();
  //     }

  //     throw 'Fallback!';
  //   }

  //   async function Child(): Promise<string> {
  //     await setImmediate();
  //     return 'Child!';
  //   }

  //   try {
  //     await text(
  //       renderToStream((rid) => (
  //         <div>
  //           <Suspense rid={rid} fallback={<Fallback />}>
  //             <Child />
  //           </Suspense>
  //         </div>
  //       ))
  //     );

  //     assert.fail('should throw');
  //   } catch (error) {
  //     assert.equal(error, 'Fallback!');
  //   }
  // });
});

describe('Generator errors', () => {
  it('throws when rid is not provided', async () => {
    await assert.rejects(
      text(
        renderToStream(() => (
          //@ts-expect-error
          <Generator />
        ))
      ),
      /Error: Generator requires a `rid` to be specified./
    );
  });
});
