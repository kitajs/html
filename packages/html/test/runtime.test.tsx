import test, { describe } from 'node:test';

import assert from 'node:assert';
import { createElement, h } from '../';
import { jsx, jsxs } from '../jsx-runtime';

describe('Runtime behavior of JSX', () => {
  test('createElement', () => {
    function Component(props: any) {
      return <div {...props}></div>;
    }

    async function AsyncComponent() {
      return Promise.resolve('<div>1</div>');
    }

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

    // render Component
    assert.equal(createElement(Component, null), '<div></div>');
    assert.equal(createElement(Component, {}, 'child'), '<div>child</div>');
    assert.equal(
      createElement(Component, null, 'child ', 'child2'),
      '<div>child child2</div>'
    );
    assert.equal(
      createElement(Component, {}, 'child ', 'child2'),
      '<div>child child2</div>'
    );

    // render tag
    assert.equal(
      createElement('tag', { of: 'custom-html-tag' }),
      '<custom-html-tag></custom-html-tag>'
    );

    // render async Component
    assert.ok(
      createElement('div', null, createElement(AsyncComponent, null)) instanceof Promise
    );

    // void element
    assert.equal(createElement('meta', null), '<meta/>');
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

    // render tag
    assert.equal(
      jsx('tag', { of: 'custom-html-tag' }),
      '<custom-html-tag></custom-html-tag>'
    );

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

    // epmty childrens
    assert.equal(jsxs('div', { id: 'test', children: [] }), '<div id="test"></div>');

    // void element
    assert.equal(jsxs('meta', { children: [] }), '<meta/>');

    // Array children
    assert.equal(jsxs(Component, { id: 'test', children: ['Hello'] }), ['Hello']);
  });
});
