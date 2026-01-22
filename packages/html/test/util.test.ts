import { describe, expect, test } from 'vitest';
import { Html } from '../src/index.js';

describe('Util', () => {
  test('Undefined contents', async () => {
    expect(
      await Html.contentsToString([
        undefined,
        Promise.resolve(undefined),
        [undefined, Promise.resolve(undefined)],
        null,
        Promise.resolve(null),
        [null, Promise.resolve(null)],
        [[[[[[[]]]]]]]
      ])
    ).toBe('');

    for (const i of [
      undefined,
      Promise.resolve(undefined),
      [undefined, Promise.resolve(undefined)],
      null,
      Promise.resolve(null),
      [null, Promise.resolve(null)],
      [[[[[[[]]]]]]]
    ]) {
      expect(await Html.contentToString(i)).toBe('');
    }

    expect(await Html.contentsToString([])).toBe('');
  });

  test('Deep scaping', async () => {
    expect(await Html.contentsToString(['<>', Promise.resolve('<>')], true)).toBe(
      '&lt;>&lt;>'
    );

    expect(
      await Html.contentsToString(
        [
          undefined,
          Promise.resolve(undefined),
          [undefined, Promise.resolve(undefined)],
          null,
          Promise.resolve(null),
          [null, Promise.resolve(null)],
          [[[[[[['<>']]]]]]]
        ],
        true
      )
    ).toBe('&lt;>');
  });

  test('String contents', async () => {
    expect(
      await Html.contentsToString([
        'a',
        Promise.resolve('b'),
        ['c', Promise.resolve('d')]
      ])
    ).toBe('abcd');
  });

  test('Only string contents', async () => {
    expect(await Html.contentsToString(['a', 'b', ['c', 'd']])).toBe('abcd');
  });

  test('Promises', async () => {
    const result = Html.contentsToString([
      Promise.resolve('a'),
      Promise.resolve('b'),
      Promise.resolve(['c', Promise.resolve('d')])
    ]);

    expect(result instanceof Promise).toBeTruthy();
    expect(await result).toBe('abcd');
  });

  test('h() function', async () => {
    expect(Html.h).toBe(Html.createElement);
  });
});
