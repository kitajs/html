import assert from 'node:assert';
import test, { describe } from 'node:test';

describe('Attributes', () => {
  test('Numbers', () => {
    assert.equal(
      '<ol start="1"><li value="2">2</li></ol>',
      <ol start={1}>
        <li value={2}>2</li>
      </ol>
    );

    assert.equal(
      '<meter value="2" min="1" max="3" low="0" high="5" optimum="3"></meter>',
      <meter value={2} min={1} max={3} low={0} high={5} optimum={3}></meter>
    );

    assert.equal(
      '<progress value="2" max="5"></progress>',
      <progress value={2} max={5}></progress>
    );

    assert.equal('<td colspan="2" rowspan="5"></td>', <td colspan={2} rowspan={5}></td>);

    assert.equal('<th colspan="2" rowspan="5"></th>', <th colspan={2} rowspan={5}></th>);
  });

  test('Booleans', () => {
    // https://www.w3.org/TR/html5/infrastructure.html#boolean-attributes
    assert.equal('<input checked/>', <input checked={true}></input>);

    assert.equal('<input/>', <input checked={false}></input>);

    assert.equal('<input disabled/>', <input disabled={true}></input>);

    assert.equal('<input/>', <input disabled={false}></input>);

    assert.equal(
      '<p draggable spellcheck hidden translate></p>',
      <p draggable spellcheck hidden translate></p>
    );

    assert.equal(
      '<p></p>',
      <p draggable={false} spellcheck={false} hidden={false} translate={false}></p>
    );

    assert.equal('<form novalidate></form>', <form novalidate></form>);
  });

  test('Dates & Objects', () => {
    const date = new Date();
    assert.equal(<del datetime={date} />, `<del datetime="${date.toISOString()}"></del>`);

    assert.equal(<div test={{}}></div>, '<div test="[object Object]"></div>');
  });

  test('class arrays', () => {
    assert.equal(<div class="name" />, '<div class="name"></div>');
    assert.equal(<div class={['name']} />, '<div class="name"></div>');
    assert.equal(<div class={['' && 'name']} />, '<div></div>');

    assert.equal(
      <div class={[false && 'a', 'name', null && 'b', 0 && 'c']} />,
      '<div class="name"></div>'
    );

    assert.equal(
      <div class={['a b c d', false && 'e', true && 'f', 'g h i j']} />,
      '<div class="a b c d f g h i j"></div>'
    );

    assert.equal(
      <div class={['a', 'b', 'c', 'd', false && 'e', true && 'f', 'g', 'h', 'i', 'j']} />,
      '<div class="a b c d f g h i j"></div>'
    );
  });

  test('attrs attribute', () => {
    assert.equal(
      <div attrs={{ 'data-test': 'test', 'data-test2': 'test2' }} />,
      '<div data-test="test" data-test2="test2"></div>'
    );

    assert.equal(
      <div attrs={{ 'data-test': 'test', 'data-test2': 'test2' }} data-test3="test3" />,
      '<div data-test="test" data-test2="test2" data-test3="test3"></div>'
    );

    assert.equal(
      <div attrs='data-test="test" data-test2="test2"'></div>,
      '<div data-test="test" data-test2="test2"></div>'
    );

    // duplicates
    assert.equal(
      <div attrs='data-test="test" data-test2="test2"' data-test="test3"></div>,
      '<div data-test="test" data-test2="test2" data-test="test3"></div>'
    );

    // escapes object
    assert.equal(
      <div attrs={{ 'data-test': 'te"st', 'data-test2': 'test2' }} data-test="test3" />,
      '<div data-test="te&#34;st" data-test2="test2" data-test="test3"></div>'
    );

    // does not escape string
    assert.equal(
      <div attrs='data-test="te"st" data-test2="test2"' data-test="test3" />,
      `<div data-test="te"st" data-test2="test2" data-test="test3"></div>`
    );
  });
});
