import { describe, expect, test } from 'vitest';
import { createElement, h } from '../src/index.js';
import { jsx, jsxs } from '../src/jsx-runtime.js';

describe('Runtime behavior of JSX', () => {
  test('createElement', () => {
    function Component(props: any) {
      return <div {...props}></div>;
    }

    async function AsyncComponent() {
      return Promise.resolve('<div>1</div>');
    }

    expect(createElement).toBe(h);

    // children
    expect(createElement('div', { id: 'test' }, 'Hello')).toMatchInlineSnapshot(
      `"<div id="test">Hello</div>"`
    );

    // no children
    expect(createElement('div', { id: 'test' })).toMatchInlineSnapshot(
      `"<div id="test"></div>"`
    );

    // no attributes
    expect(createElement('div', null)).toMatchInlineSnapshot(`"<div></div>"`);

    // render Component
    expect(createElement(Component, null)).toMatchInlineSnapshot(`"<div></div>"`);
    expect(createElement(Component, {}, 'child')).toMatchInlineSnapshot(
      `"<div>child</div>"`
    );
    expect(createElement(Component, null, 'child ', 'child2')).toMatchInlineSnapshot(
      `"<div>child child2</div>"`
    );
    expect(createElement(Component, {}, 'child ', 'child2')).toMatchInlineSnapshot(
      `"<div>child child2</div>"`
    );

    // render tag
    expect(createElement('tag', { of: 'custom-html-tag' })).toMatchInlineSnapshot(
      `"<custom-html-tag></custom-html-tag>"`
    );

    // render async Component
    expect(
      createElement('div', null, createElement(AsyncComponent, null)) instanceof Promise
    ).toBeTruthy();

    // void element
    expect(createElement('meta', null)).toMatchInlineSnapshot(`"<meta/>"`);
  });

  test('jsx', () => {
    function Component(attrs: any) {
      expect(attrs.children).toEqual('Hello');
      return 'Hello';
    }

    // child
    expect(jsx('div', { id: 'test', children: 'Hello' })).toMatchInlineSnapshot(
      `"<div id="test">Hello</div>"`
    );

    // no child
    expect(jsx('div', { id: 'test' })).toMatchInlineSnapshot(`"<div id="test"></div>"`);

    // no attributes
    expect(jsx('div', {})).toMatchInlineSnapshot(`"<div></div>"`);

    // render tag
    expect(jsx('tag', { of: 'custom-html-tag' })).toMatchInlineSnapshot(
      `"<custom-html-tag></custom-html-tag>"`
    );

    // Single child
    expect(jsx(Component, { id: 'test', children: 'Hello' })).toBe('Hello');
  });

  test('jsxs', () => {
    function Component(attrs: any) {
      expect(attrs.children).toEqual(['Hello']);
      return 'Hello';
    }

    // child
    expect(jsxs('div', { id: 'test', children: ['Hello'] })).toMatchInlineSnapshot(
      `"<div id="test">Hello</div>"`
    );

    // epmty childrens
    expect(jsxs('div', { id: 'test', children: [] })).toMatchInlineSnapshot(
      `"<div id="test"></div>"`
    );

    // void element
    expect(jsxs('meta', { children: [] })).toMatchInlineSnapshot(`"<meta/>"`);

    // Array children
    expect(jsxs(Component, { id: 'test', children: ['Hello'] })).toMatchInlineSnapshot(
      `"Hello"`
    );
  });
});
