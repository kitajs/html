import { describe, expect, test } from 'vitest';

describe('HTML Encoding', () => {
  test('should encode " as &#34', () => {
    expect(<div class={'"'}></div>).toMatchInlineSnapshot(`"<div class="&#34;"></div>"`);
  });

  test('should encode & as &amp', () => {
    expect(
      <div class={'&'} safe>
        &
      </div>
    ).toMatchInlineSnapshot(`"<div class="&">&amp;</div>"`);
  });

  test('should NOT encode \\u00A0 as &#32', () => {
    expect(<div class={'\u00A0'}></div>).toMatchInlineSnapshot(`"<div class=" "></div>"`);
  });

  test('should encode date attributes as ISO strings', () => {
    const date = new Date();

    //@ts-expect-error - testing date attribute
    expect(<div datetime={date}></div>).toBe(
      `<div datetime="${date.toISOString()}"></div>`
    );
  });

  test('using a Date type attribute', () => {
    expect(
      <time datetime={new Date('1914-12-20T08:00+0000')}></time>
    ).toMatchInlineSnapshot(`"<time datetime="1914-12-20T08:00:00.000Z"></time>"`);

    expect(
      <ins datetime={new Date('1914-12-20T08:00+0000')}>new</ins>
    ).toMatchInlineSnapshot(`"<ins datetime="1914-12-20T08:00:00.000Z">new</ins>"`);

    expect(
      <del datetime={new Date('1914-12-20T08:00+0000')}>old</del>
    ).toMatchInlineSnapshot(`"<del datetime="1914-12-20T08:00:00.000Z">old</del>"`);

    expect(
      <time datetime={new Date('1914-12-20T08:00+0000').toISOString()}></time>
    ).toMatchInlineSnapshot(`"<time datetime="1914-12-20T08:00:00.000Z"></time>"`);

    expect(
      <ins datetime={new Date('1914-12-20T08:00+0000').toISOString()}>new</ins>
    ).toMatchInlineSnapshot(`"<ins datetime="1914-12-20T08:00:00.000Z">new</ins>"`);

    expect(
      <del datetime={new Date('1914-12-20T08:00+0000').toISOString()}>old</del>
    ).toMatchInlineSnapshot(`"<del datetime="1914-12-20T08:00:00.000Z">old</del>"`);
  });
});
