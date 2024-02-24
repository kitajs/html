import assert from 'node:assert';
import test, { describe } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import Html from '../index';

async function Async(props: Html.PropsWithChildren) {
  await setImmediate(); // simple way to ensure async-ness
  return <div>{props.children}</div>;
}

function Sync(props: Html.PropsWithChildren) {
  return <div>{props.children}</div>;
}

describe('Async components', () => {
  test('Components', async () => {
    assert(<Sync>{1}</Sync>, '<div>1</div>');
    assert.ok(<Async>{1}</Async> instanceof Promise);
    assert(await (<Async>{1}</Async>), '<div>1</div>');
  });

  test('Children', async () => {
    const html = (
      <Sync>
        <Async>{1}</Async>
      </Sync>
    );

    assert.ok(html instanceof Promise);
    assert(await html, '<div>1</div>');
  });
});
