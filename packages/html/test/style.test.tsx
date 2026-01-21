import { describe, expect, test } from 'vitest';
import { styleToString } from '../src/index.js';

describe('Style', () => {
  test('camel case property', () => {
    expect(
      <>
        <div style={{ backgroundColor: 'red' }}></div>
        <div style="background-color: blue;"></div>
        <div style="background-color:green;"></div>
        <div style="backgroundColor:green;"></div>
      </>
    ).toMatchInlineSnapshot(
      `"<div style="background-color:red;"></div><div style="background-color: blue;"></div><div style="background-color:green;"></div><div style="backgroundColor:green;"></div>"`
    );
  });

  test('accepts undefined', () => {
    expect(<div style={{ backgroundColor: undefined }}></div>).toMatchInlineSnapshot(
      `"<div style=""></div>"`
    );

    expect(<div style={undefined}></div>).toMatchInlineSnapshot(`"<div></div>"`);
  });

  test('CSSProperties', () => {
    const style: JSX.CSSProperties = {
      color: 'red',
      //@ts-expect-error - should complain
      not: 'defined'
    };

    expect(<div style={style} />).toMatchInlineSnapshot(
      `"<div style="color:red;not:defined;"></div>"`
    );
  });

  test('Weird values', () => {
    expect(
      styleToString({
        a: 0,
        b: undefined,
        c: 1,
        d: '2',
        e: { f: 3 }
      })
    ).toBe('a:0;c:1;d:2;e:[object Object];');
  });
});
