import assert from 'node:assert';
import test, { describe } from 'node:test';
import Html from '../index';

const unsafeTag = '<script tag="1">alert(1)</script>';
const safeTag = Html.escapeHtml(unsafeTag);

describe('HTML Escaping', () => {
  test('escapes content', () => {
    assert.equal(<>{unsafeTag}</>, <>{unsafeTag}</>);
  });

  test('with children', () => {
    assert.equal(
      <>
        <div>{unsafeTag}</div>
      </>,
      <>
        <div>{unsafeTag}</div>
      </>
    );
  });

  test('escapes children', () => {
    assert.equal(
      <>
        <div safe>{unsafeTag}</div>
      </>,
      <>
        <div>{safeTag}</div>
      </>
    );
  });

  test('escapes deep children', () => {
    assert.equal(
      <>
        <div safe>
          <div>{unsafeTag}</div>
        </div>
      </>,
      <>
        <div>{Html.escapeHtml(<div>{unsafeTag}</div>)}</div>
      </>
    );
  });

  test('always escapes attributes', () => {
    assert.equal(
      <>
        <div style={'"&<>\''}></div>
        <div style={{ backgroundColor: '"&<>\'' }}></div>
        <div class={'"&<>\''}></div>
        <div class={'test:1" xss="false'}></div>
      </>,
      <>
        <div style="&#34;&<>'"></div>
        <div style="background-color:&#34;&<>';"></div>
        <div class="&#34;&<>'"></div>
        <div class="test:1&#34; xss=&#34;false"></div>
      </>
    );

    assert.equal(
      <>
        <div style={`"&<>'`}></div>
        <div style={{ backgroundColor: `"&<>'` }}></div>
        <div class={`"&<>'`}></div>
      </>,
      `<div style="&#34;&<>'"></div><div style="background-color:&#34;&<>';"></div><div class="&#34;&<>'"></div>`
    );
  });

  test('handles unknown values', () => {
    assert.equal(Html.escapeHtml(''), '');
    assert.equal(Html.escapeHtml({ a: 1 }), '[object Object]');
  });

  // The matrix of cases we need to test for:
  // 1. Works with short strings
  // 2. Works with long strings
  // 3. Works with latin1 strings
  // 4. Works with utf16 strings
  // 5. Works when the text to escape is somewhere in the middle
  // 6. Works when the text to escape is in the beginning
  // 7. Works when the text to escape is in the end
  // 8. Returns the same string when there's no need to escape
  test('always escapeHtml', () => {
    assert.equal(
      Html.escapeHtml('absolutely nothing to do here'),
      'absolutely nothing to do here'
    );
    assert.equal(
      Html.escapeHtml('<script>alert(1)</script>'),
      '&lt;script>alert(1)&lt;/script>'
    );
    assert.equal(Html.escapeHtml('<'), '&lt;');
    assert.equal(Html.escapeHtml('>'), '>');
    assert.equal(Html.escapeHtml('&'), '&amp;');
    assert.equal(Html.escapeHtml("'"), '&#39;');
    assert.equal(Html.escapeHtml('"'), '&#34;');
    assert.equal(Html.escapeHtml('\n'), '\n');
    assert.equal(Html.escapeHtml('\r'), '\r');
    assert.equal(Html.escapeHtml('\t'), '\t');
    assert.equal(Html.escapeHtml('\f'), '\f');
    assert.equal(Html.escapeHtml('\v'), '\v');
    assert.equal(Html.escapeHtml('\b'), '\b');
    assert.equal(Html.escapeHtml('\u00A0'), '\u00A0');
    assert.equal(Html.escapeHtml('<script>ab'), '&lt;script>ab');
    assert.equal(Html.escapeHtml('<script>'), '&lt;script>');
    assert.equal(Html.escapeHtml('<script><script>'), '&lt;script>&lt;script>');

    assert.equal(
      Html.escapeHtml('lalala' + '<script>alert(1)</script>' + 'lalala'),
      'lalala&lt;script>alert(1)&lt;/script>lalala'
    );

    assert.equal(
      Html.escapeHtml('<script>alert(1)</script>' + 'lalala'),
      '&lt;script>alert(1)&lt;/script>lalala'
    );
    assert.equal(
      Html.escapeHtml('lalala' + '<script>alert(1)</script>'),
      'lalala' + '&lt;script>alert(1)&lt;/script>'
    );

    assert.equal(Html.escapeHtml('What does 😊 mean?'), 'What does 😊 mean?');

    assert.equal(Html.escapeHtml('<What does 😊'), '&lt;What does 😊');
    assert.equal(
      Html.escapeHtml('<div>What does 😊 mean in text?'),
      '&lt;div>What does 😊 mean in text?'
    );

    assert.equal(
      Html.escapeHtml(('lalala' + '<script>alert(1)</script>' + 'lalala').repeat(900)),
      'lalala&lt;script>alert(1)&lt;/script>lalala'.repeat(900)
    );
    assert.equal(
      Html.escapeHtml(('<script>alert(1)</script>' + 'lalala').repeat(900)),
      '&lt;script>alert(1)&lt;/script>lalala'.repeat(900)
    );
    assert.equal(
      Html.escapeHtml(('lalala' + '<script>alert(1)</script>').repeat(900)),
      ('lalala' + '&lt;script>alert(1)&lt;/script>').repeat(900)
    );

    // the positions of the unicode codepoint are important
    // our simd code for U16 is at 8 bytes, so we need to especially check the boundaries
    assert.equal(
      Html.escapeHtml('😊lalala' + '<script>alert(1)</script>' + 'lalala'),
      '😊lalala&lt;script>alert(1)&lt;/script>lalala'
    );
    assert.equal(
      Html.escapeHtml('<script>😊alert(1)</script>' + 'lalala'),
      '&lt;script>😊alert(1)&lt;/script>lalala'
    );
    assert.equal(
      Html.escapeHtml('<script>alert(1)😊</script>' + 'lalala'),
      '&lt;script>alert(1)😊&lt;/script>lalala'
    );
    assert.equal(
      Html.escapeHtml('<script>alert(1)</script>' + '😊lalala'),
      '&lt;script>alert(1)&lt;/script>😊lalala'
    );
    assert.equal(
      Html.escapeHtml('<script>alert(1)</script>' + 'lal😊ala'),
      '&lt;script>alert(1)&lt;/script>lal😊ala'
    );
    assert.equal(
      Html.escapeHtml('<script>alert(1)</script>' + 'lal😊ala'.repeat(10)),
      '&lt;script>alert(1)&lt;/script>' + 'lal😊ala'.repeat(10)
    );

    for (let i = 1; i < 10; i++)
      assert.equal(
        Html.escapeHtml('<script>alert(1)</script>' + 'la😊'.repeat(i)),
        '&lt;script>alert(1)&lt;/script>' + 'la😊'.repeat(i)
      );

    assert.equal(
      Html.escapeHtml('la😊' + '<script>alert(1)</script>'),
      'la😊' + '&lt;script>alert(1)&lt;/script>'
    );
    assert.equal(
      Html.escapeHtml(('lalala' + '<script>alert(1)</script>😊').repeat(1)),
      ('lalala' + '&lt;script>alert(1)&lt;/script>😊').repeat(1)
    );

    assert.equal(Html.escapeHtml('😊'.repeat(100)), '😊'.repeat(100));
    assert.equal(Html.escapeHtml('😊<'.repeat(100)), '😊&lt;'.repeat(100));
    assert.equal(Html.escapeHtml('<😊>'.repeat(100)), '&lt;😊>'.repeat(100));
    assert.equal(Html.escapeHtml('😊'), '😊');
    assert.equal(Html.escapeHtml('😊😊'), '😊😊');
    assert.equal(Html.escapeHtml('😊lo'), '😊lo');
    assert.equal(Html.escapeHtml('lo😊'), 'lo😊');

    assert.equal(Html.escapeHtml(' '.repeat(32) + '😊'), ' '.repeat(32) + '😊');
    assert.equal(Html.escapeHtml(' '.repeat(32) + '😊😊'), ' '.repeat(32) + '😊😊');
    assert.equal(Html.escapeHtml(' '.repeat(32) + '😊lo'), ' '.repeat(32) + '😊lo');
    assert.equal(Html.escapeHtml(' '.repeat(32) + 'lo😊'), ' '.repeat(32) + 'lo😊');
  });
});
