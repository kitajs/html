import { describe, expect, test } from 'vitest';
import * as Html from '../src/index.js';

const unsafeTag = '<script tag="1">alert(1)</script>';
const safeTag = Html.escapeHtml(unsafeTag);

describe('HTML Escaping', () => {
  test('escapes content', () => {
    expect(<>{unsafeTag}</>).toBe(<>{unsafeTag}</>);
  });

  test('with children', () => {
    expect(
      <>
        <div>{unsafeTag}</div>
      </>
    ).toBe(
      <>
        <div>{unsafeTag}</div>
      </>
    );
  });

  test('escapes children', () => {
    expect(
      <>
        <div safe>{unsafeTag}</div>
      </>
    ).toBe(
      <>
        <div>{safeTag}</div>
      </>
    );
  });

  test('escapes deep children', () => {
    expect(
      <>
        <div safe>
          <div>{unsafeTag}</div>
        </div>
      </>
    ).toBe(
      <>
        <div>{Html.escapeHtml(<div>{unsafeTag}</div>)}</div>
      </>
    );
  });

  test('always escapes attributes', () => {
    expect(
      <>
        <div style={'"&<>\''}></div>
        <div style={{ backgroundColor: '"&<>\'' }}></div>
        <div class={'"&<>\''}></div>
        <div class={'test:1" xss="false'}></div>
      </>
    ).toMatchInlineSnapshot(
      `"<div style="&#34;&<>'"></div><div style="background-color:&#34;&<>';"></div><div class="&#34;&<>'"></div><div class="test:1&#34; xss=&#34;false"></div>"`
    );

    expect(
      <>
        <div style={`"&<>'`}></div>
        <div style={{ backgroundColor: `"&<>'` }}></div>
        <div class={`"&<>'`}></div>
      </>
    ).toMatchInlineSnapshot(
      `"<div style="&#34;&<>'"></div><div style="background-color:&#34;&<>';"></div><div class="&#34;&<>'"></div>"`
    );
  });

  test('handles unknown values', () => {
    expect(Html.escapeHtml('')).toBe('');
    expect(Html.escapeHtml({ a: 1 })).toBe('[object Object]');
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
    expect(Html.escapeHtml('absolutely nothing to do here')).toBe(
      'absolutely nothing to do here'
    );
    expect(Html.escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script>alert(1)&lt;/script>'
    );
    expect(Html.escapeHtml('<')).toBe('&lt;');
    expect(Html.escapeHtml('>')).toBe('>');
    expect(Html.escapeHtml('&')).toBe('&amp;');
    expect(Html.escapeHtml("'")).toBe('&#39;');
    expect(Html.escapeHtml('"')).toBe('&#34;');
    expect(Html.escapeHtml('\n')).toBe('\n');
    expect(Html.escapeHtml('\r')).toBe('\r');
    expect(Html.escapeHtml('\t')).toBe('\t');
    expect(Html.escapeHtml('\f')).toBe('\f');
    expect(Html.escapeHtml('\v')).toBe('\v');
    expect(Html.escapeHtml('\b')).toBe('\b');
    expect(Html.escapeHtml('\u00A0')).toBe('\u00A0');
    expect(Html.escapeHtml('<script>ab')).toBe('&lt;script>ab');
    expect(Html.escapeHtml('<script>')).toBe('&lt;script>');
    expect(Html.escapeHtml('<script><script>')).toBe('&lt;script>&lt;script>');

    expect(Html.escapeHtml('lalala' + '<script>alert(1)</script>' + 'lalala')).toBe(
      'lalala&lt;script>alert(1)&lt;/script>lalala'
    );

    expect(Html.escapeHtml('<script>alert(1)</script>' + 'lalala')).toBe(
      '&lt;script>alert(1)&lt;/script>lalala'
    );
    expect(Html.escapeHtml('lalala' + '<script>alert(1)</script>')).toBe(
      'lalala' + '&lt;script>alert(1)&lt;/script>'
    );

    expect(Html.escapeHtml('What does 😊 mean?')).toBe('What does 😊 mean?');

    expect(Html.escapeHtml('<What does 😊')).toBe('&lt;What does 😊');
    expect(Html.escapeHtml('<div>What does 😊 mean in text?')).toBe(
      '&lt;div>What does 😊 mean in text?'
    );

    expect(
      Html.escapeHtml(('lalala' + '<script>alert(1)</script>' + 'lalala').repeat(900))
    ).toBe('lalala&lt;script>alert(1)&lt;/script>lalala'.repeat(900));
    expect(Html.escapeHtml(('<script>alert(1)</script>' + 'lalala').repeat(900))).toBe(
      '&lt;script>alert(1)&lt;/script>lalala'.repeat(900)
    );
    expect(Html.escapeHtml(('lalala' + '<script>alert(1)</script>').repeat(900))).toBe(
      ('lalala' + '&lt;script>alert(1)&lt;/script>').repeat(900)
    );

    // the positions of the unicode codepoint are important
    // our simd code for U16 is at 8 bytes, so we need to especially check the boundaries
    expect(Html.escapeHtml('😊lalala' + '<script>alert(1)</script>' + 'lalala')).toBe(
      '😊lalala&lt;script>alert(1)&lt;/script>lalala'
    );
    expect(Html.escapeHtml('<script>😊alert(1)</script>' + 'lalala')).toBe(
      '&lt;script>😊alert(1)&lt;/script>lalala'
    );
    expect(Html.escapeHtml('<script>alert(1)😊</script>' + 'lalala')).toBe(
      '&lt;script>alert(1)😊&lt;/script>lalala'
    );
    expect(Html.escapeHtml('<script>alert(1)</script>' + '😊lalala')).toBe(
      '&lt;script>alert(1)&lt;/script>😊lalala'
    );
    expect(Html.escapeHtml('<script>alert(1)</script>' + 'lal😊ala')).toBe(
      '&lt;script>alert(1)&lt;/script>lal😊ala'
    );
    expect(Html.escapeHtml('<script>alert(1)</script>' + 'lal😊ala'.repeat(10))).toBe(
      '&lt;script>alert(1)&lt;/script>' + 'lal😊ala'.repeat(10)
    );

    for (let i = 1; i < 10; i++)
      expect(Html.escapeHtml('<script>alert(1)</script>' + 'la😊'.repeat(i))).toBe(
        '&lt;script>alert(1)&lt;/script>' + 'la😊'.repeat(i)
      );

    expect(Html.escapeHtml('la😊' + '<script>alert(1)</script>')).toBe(
      'la😊' + '&lt;script>alert(1)&lt;/script>'
    );
    expect(Html.escapeHtml(('lalala' + '<script>alert(1)</script>😊').repeat(1))).toBe(
      ('lalala' + '&lt;script>alert(1)&lt;/script>😊').repeat(1)
    );

    expect(Html.escapeHtml('😊'.repeat(100))).toBe('😊'.repeat(100));
    expect(Html.escapeHtml('😊<'.repeat(100))).toBe('😊&lt;'.repeat(100));
    expect(Html.escapeHtml('<😊>'.repeat(100))).toBe('&lt;😊>'.repeat(100));
    expect(Html.escapeHtml('😊')).toBe('😊');
    expect(Html.escapeHtml('😊😊')).toBe('😊😊');
    expect(Html.escapeHtml('😊lo')).toBe('😊lo');
    expect(Html.escapeHtml('lo😊')).toBe('lo😊');

    expect(Html.escapeHtml(' '.repeat(32) + '😊')).toBe(' '.repeat(32) + '😊');
    expect(Html.escapeHtml(' '.repeat(32) + '😊😊')).toBe(' '.repeat(32) + '😊😊');
    expect(Html.escapeHtml(' '.repeat(32) + '😊lo')).toBe(' '.repeat(32) + '😊lo');
    expect(Html.escapeHtml(' '.repeat(32) + 'lo😊')).toBe(' '.repeat(32) + 'lo😊');
  });
});
