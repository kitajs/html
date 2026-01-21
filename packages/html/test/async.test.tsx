import { setImmediate } from 'node:timers/promises';
import { describe, expect, test } from 'vitest';
import * as Html from '../src/index.js';

async function Async(props: Html.PropsWithChildren) {
  await setImmediate(); // simple way to ensure async-ness
  return <div>{props.children}</div>;
}

function Sync(props: Html.PropsWithChildren) {
  return <div>{props.children}</div>;
}

describe('Async components', () => {
  test('Components', async () => {
    expect(<Sync>{1}</Sync>).toBeTruthy();
    expect(<Async>{1}</Async> instanceof Promise).toBeTruthy();
    expect(await (<Async>{1}</Async>)).toBeTruthy();
  });

  test('Child', async () => {
    const html = (
      <Sync>
        <Async>{1}</Async>
      </Sync>
    );

    expect(html instanceof Promise).toBeTruthy();
    expect(await html).toBeTruthy();
  });

  test('Children', async () => {
    const html = (
      <div>
        <Async>
          {1} {2}
        </Async>
        <Async>
          {3} {4}
        </Async>
      </div>
    );

    expect(html instanceof Promise).toBeTruthy();
    expect(await html).toBeTruthy();
  });
});
