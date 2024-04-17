import assert from 'node:assert';
import test, { describe } from 'node:test';

describe('Expose correct html standards types', () => {
  test('Select', () => {
    assert.equal(
      '<select onchange="jsFunctionCall()"><option value="dog">Dog</option><option value="cat">Cat</option></select>',
      <select onchange="jsFunctionCall()">
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
      </select>
    );
  });
});
