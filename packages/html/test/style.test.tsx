import assert from 'node:assert';
import test, { describe } from 'node:test';
import { styleToString } from '../index';

describe('Style', () => {
  test('camel case property', () => {
    assert.equal(
      <>
        <div style={{ backgroundColor: 'red' }}></div>
        <div style="background-color: blue;"></div>
        <div style="background-color:green;"></div>
        <div style="backgroundColor:green;"></div>
      </>,
      '<div style="background-color:red;"></div><div style="background-color: blue;"></div><div style="background-color:green;"></div><div style="backgroundColor:green;"></div>'
    );
  });

  test('CSSProperties', () => {
    const style: JSX.CSSProperties = {
      color: 'red',
      //@ts-expect-error - should complain
      not: 'defined'
    };

    assert.equal(<div style={style} />, '<div style="color:red;not:defined;"></div>');
  });

  test('Weird values', () => {
    assert.equal(
      styleToString({
        a: 0,
        b: undefined,
        c: 1,
        d: '2',
        e: { f: 3 }
      }),
      'a:0;c:1;d:2;e:[object Object];'
    );
  });
});
