import test, { describe } from 'node:test';

import assert from 'node:assert';
import { createElement, h } from '../';
import { jsx, jsxs } from '../jsx-runtime';

describe('Runtime behavior of JSX', () => {
  test('createElement', () => {
    assert.strictEqual(createElement, h);

    // children
    assert.equal(
      createElement('div', { id: 'test' }, 'Hello'),
      '<div id="test">Hello</div>'
    );

    // no children
    assert.equal(createElement('div', { id: 'test' }), '<div id="test"></div>');

    // no attributes
    assert.equal(createElement('div', null), '<div></div>');
  });

  test('jsx', () => {
    function Component(attrs: any) {
      assert.deepStrictEqual(attrs.children, 'Hello');
      return 'Hello';
    }

    // child
    assert.equal(
      jsx('div', { id: 'test', children: 'Hello' }),
      '<div id="test">Hello</div>'
    );

    // no child
    assert.equal(jsx('div', { id: 'test' }), '<div id="test"></div>');

    // no attributes
    assert.equal(jsx('div', {}), '<div></div>');

    // Single child
    assert.equal(jsx(Component, { id: 'test', children: 'Hello' }), 'Hello');
  });

  test('jsxs', () => {
    function Component(attrs: any) {
      assert.deepStrictEqual(attrs.children, ['Hello']);
      return 'Hello';
    }

    // child
    assert.equal(
      jsxs('div', { id: 'test', children: ['Hello'] }),
      '<div id="test">Hello</div>'
    );

    // Array children
    assert.equal(jsxs(Component, { id: 'test', children: ['Hello'] }), ['Hello']);
  });
});
