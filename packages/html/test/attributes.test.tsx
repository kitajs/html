import { describe, expect, test } from 'vitest';

describe('Attributes', () => {
  test('Numbers', () => {
    expect(
      <ol start={1}>
        <li value={2}>2</li>
      </ol>
    ).toMatchInlineSnapshot(`"<ol start="1"><li value="2">2</li></ol>"`);

    expect(
      <meter value={2} min={1} max={3} low={0} high={5} optimum={3}></meter>
    ).toMatchInlineSnapshot(
      `"<meter value="2" min="1" max="3" low="0" high="5" optimum="3"></meter>"`
    );

    expect(<progress value={2} max={5}></progress>).toMatchInlineSnapshot(
      `"<progress value="2" max="5"></progress>"`
    );

    expect(<td colspan={2} rowspan={5}></td>).toMatchInlineSnapshot(
      `"<td colspan="2" rowspan="5"></td>"`
    );

    expect(<th colspan={2} rowspan={5}></th>).toMatchInlineSnapshot(
      `"<th colspan="2" rowspan="5"></th>"`
    );
  });

  test('Booleans', () => {
    // https://www.w3.org/TR/html5/infrastructure.html#boolean-attributes
    expect(<input checked={true}></input>).toMatchInlineSnapshot(`"<input checked/>"`);

    expect(<input checked={false}></input>).toMatchInlineSnapshot(`"<input/>"`);

    expect(<input disabled={true}></input>).toMatchInlineSnapshot(`"<input disabled/>"`);

    expect(<input disabled={false}></input>).toMatchInlineSnapshot(`"<input/>"`);

    expect(<p draggable spellcheck hidden translate></p>).toMatchInlineSnapshot(
      `"<p draggable spellcheck hidden translate></p>"`
    );

    expect(
      <p draggable={false} spellcheck={false} hidden={false} translate={false}></p>
    ).toMatchInlineSnapshot(`"<p></p>"`);

    expect(<form novalidate></form>).toMatchInlineSnapshot(`"<form novalidate></form>"`);
  });

  test('Undefined', () => {
    expect(
      <div hidden={undefined} translate={undefined}>
        {undefined}
      </div>
    ).toMatchInlineSnapshot(`"<div></div>"`);
  });

  test('Dates & Objects', () => {
    const date = new Date();
    expect(<del datetime={date} />).toMatchInlineSnapshot(
      `"<del datetime="${date.toISOString()}"></del>"`
    );

    //@ts-expect-error - testing object attribute
    expect(<div test={{}}></div>).toMatchInlineSnapshot(
      `"<div test="[object Object]"></div>"`
    );
  });

  test('Popover', () => {
    expect(<div popover="auto"></div>).toMatchInlineSnapshot(
      `"<div popover="auto"></div>"`
    );
    expect(<div popover="manual"></div>).toMatchInlineSnapshot(
      `"<div popover="manual"></div>"`
    );

    expect(<div popover></div>).toMatchInlineSnapshot(`"<div popover></div>"`);
  });

  test('class arrays', () => {
    expect(<div class="name" />).toMatchInlineSnapshot(`"<div class="name"></div>"`);
    expect(<div class={['name']} />).toMatchInlineSnapshot(`"<div class="name"></div>"`);
    //@ts-expect-error - This kind of expression is always falsy.
    expect(<div class={['' && 'name']} />).toMatchInlineSnapshot(`"<div></div>"`);

    expect(
      //@ts-expect-error - This kind of expression is always falsy.
      <div class={[false && 'a', 'name', null && 'b', 0 && 'c']} />
    ).toMatchInlineSnapshot(`"<div class="name"></div>"`);

    expect(
      <div class={['a b c d', false && 'e', true && 'f', 'g h i j']} />
    ).toMatchInlineSnapshot(`"<div class="a b c d f g h i j"></div>"`);

    expect(
      <div class={['a', 'b', 'c', 'd', false && 'e', true && 'f', 'g', 'h', 'i', 'j']} />
    ).toMatchInlineSnapshot(`"<div class="a b c d f g h i j"></div>"`);
  });

  test('attrs attribute', () => {
    expect(
      <div attrs={{ 'data-test': 'test', 'data-test2': 'test2' }} />
    ).toMatchInlineSnapshot(`"<div data-test="test" data-test2="test2"></div>"`);

    expect(
      <div attrs={{ 'data-test': 'test', 'data-test2': 'test2' }} data-test3="test3" />
    ).toMatchInlineSnapshot(
      `"<div data-test="test" data-test2="test2" data-test3="test3"></div>"`
    );

    expect(<div attrs='data-test="test" data-test2="test2"'></div>).toMatchInlineSnapshot(
      `"<div data-test="test" data-test2="test2"></div>"`
    );

    // duplicates
    expect(
      <div attrs='data-test="test" data-test2="test2"' data-test="test3"></div>
    ).toMatchInlineSnapshot(
      `"<div data-test="test" data-test2="test2" data-test="test3"></div>"`
    );

    // escapes object
    expect(
      <div attrs={{ 'data-test': 'te"st', 'data-test2': 'test2' }} data-test="test3" />
    ).toMatchInlineSnapshot(
      `"<div data-test="te&#34;st" data-test2="test2" data-test="test3"></div>"`
    );

    // does not escape string
    expect(
      <div attrs='data-test="te"st" data-test2="test2"' data-test="test3" />
    ).toMatchInlineSnapshot(
      `"<div data-test="te"st" data-test2="test2" data-test="test3"></div>"`
    );
  });
});
