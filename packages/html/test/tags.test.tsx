import { describe, expect, test } from 'vitest';

describe('Tags', () => {
  test('Self-closing html tags', () => {
    expect(<area></area>).toMatchInlineSnapshot(`"<area/>"`);

    expect(<hr></hr>).toMatchInlineSnapshot(`"<hr/>"`);

    expect(<hr>content</hr>).toMatchInlineSnapshot(`"<hr>content</hr>"`);

    expect(<meta charset="utf8"></meta>).toMatchInlineSnapshot(
      `"<meta charset="utf8"/>"`
    );

    expect(<video autoplay></video>).toMatchInlineSnapshot(`"<video autoplay></video>"`);
    //@ts-expect-error - invalid type
    expect(<video autoplay=""></video>).toMatchInlineSnapshot(
      `"<video autoplay=""></video>"`
    );
    //@ts-expect-error - invalid type
    expect(<video autoplay="test"></video>).toMatchInlineSnapshot(
      `"<video autoplay="test"></video>"`
    );
  });

  test('custom tag', () => {
    expect(<tag of="div" attr />).toMatchInlineSnapshot(`"<div attr></div>"`);

    expect(<tag of="div" attr></tag>).toMatchInlineSnapshot(`"<div attr></div>"`);
    expect(
      <tag of="div" attr>
        <div></div>
        <div></div>
      </tag>
    ).toMatchInlineSnapshot(`"<div attr><div></div><div></div></div>"`);

    expect(
      <tag of="div" attr>
        1
      </tag>
    ).toMatchInlineSnapshot(`"<div attr>1</div>"`);

    expect(
      <tag of="div" attr>
        {' '}
      </tag>
    ).toMatchInlineSnapshot(`"<div attr> </div>"`);
  });

  test('custom void tag', () => {
    expect(<tag of="link" attr />).toMatchInlineSnapshot(`"<link attr/>"`);

    expect(<tag of="link" attr></tag>).toMatchInlineSnapshot(`"<link attr/>"`);

    expect(
      <tag of="link" attr>
        1
      </tag>
    ).toMatchInlineSnapshot(`"<link attr>1</link>"`);

    expect(
      <tag of="link" attr>
        {' '}
      </tag>
    ).toMatchInlineSnapshot(`"<link attr> </link>"`);

    expect(<tag of="my-custom-KEBAB" />).toMatchInlineSnapshot(
      `"<my-custom-KEBAB></my-custom-KEBAB>"`
    );
  });
});
