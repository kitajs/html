import assert from 'node:assert';
import test, { describe } from 'node:test';

describe('HTML Encoding', () => {
  test('should encode " as &#34', () => {
    assert.equal(<div class={'"'}></div>, '<div class="&#34;"></div>');
  });

  test('should encode & as &amp', () => {
    assert.equal(
      <div class={'&'} safe>
        &
      </div>,
      '<div class="&">&amp;</div>'
    );
  });

  test('should NOT encode \\u00A0 as &#32', () => {
    assert.equal(<div class={'\u00A0'}></div>, '<div class="\u00A0"></div>');
  });

  test('should encode date attributes as ISO strings', () => {
    const date = new Date();

    assert.equal(
      <div datetime={date}></div>,
      `<div datetime="${date.toISOString()}"></div>`
    );
  });

  test('using a Date type attribute', () => {
    assert.equal(
      '<time datetime="1914-12-20T08:00:00.000Z"></time>',
      <time datetime={new Date('1914-12-20T08:00+0000')}></time>
    );

    assert.equal(
      '<ins datetime="1914-12-20T08:00:00.000Z">new</ins>',
      <ins datetime={new Date('1914-12-20T08:00+0000')}>new</ins>
    );

    assert.equal(
      '<del datetime="1914-12-20T08:00:00.000Z">old</del>',
      <del datetime={new Date('1914-12-20T08:00+0000')}>old</del>
    );

    assert.equal(
      '<time datetime="1914-12-20T08:00:00.000Z"></time>',
      <time datetime={new Date('1914-12-20T08:00+0000').toISOString()}></time>
    );

    assert.equal(
      '<ins datetime="1914-12-20T08:00:00.000Z">new</ins>',
      <ins datetime={new Date('1914-12-20T08:00+0000').toISOString()}>new</ins>
    );

    assert.equal(
      '<del datetime="1914-12-20T08:00:00.000Z">old</del>',
      <del datetime={new Date('1914-12-20T08:00+0000').toISOString()}>old</del>
    );
  });
});
