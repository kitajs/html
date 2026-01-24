import { describe, expect, test } from 'vitest';

describe('Attribute Encoding', () => {
  test('encodes " as &#34 in attributes', () => {
    expect(<div class={'"'}></div>).toMatchInlineSnapshot(`"<div class="&#34;"></div>"`);
  });

  test('preserves non-breaking space (\\u00A0)', () => {
    expect(<div class={'\u00A0'}></div>).toBe('<div class="\u00A0"></div>');
  });
});
