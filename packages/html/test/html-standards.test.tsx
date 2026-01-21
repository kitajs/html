import { describe, expect, test } from 'vitest';

describe('Expose correct html standards types', () => {
  test('Select', () => {
    expect(
      <select onchange="jsFunctionCall()">
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
      </select>
    ).toMatchInlineSnapshot(
      `"<select onchange="jsFunctionCall()"><option value="dog">Dog</option><option value="cat">Cat</option></select>"`
    );
  });
});
