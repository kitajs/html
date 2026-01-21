import { describe, expect, test } from 'vitest';
import * as Html from '../src/index.js';

const Header: Html.Component<any> = ({ children, ...attributes }) => (
  <h1 {...attributes}>{children}</h1>
);

function Button({ children, ...attributes }: Html.PropsWithChildren<any>) {
  return (
    <button type="button" class="original-class" {...attributes}>
      {children}
    </button>
  );
}

function AssertChildren({
  children,
  expect: expectedChildren
}: Html.PropsWithChildren<{ expect: any }>) {
  expect(children).toEqual(expectedChildren);
  return <div>{children}</div>;
}

describe('React integration', () => {
  test('react children', () => {
    expect(
      <>
        <Header class="title"></Header>
        <span>Header Text</span>
        <Button>Button Text</Button>
      </>
    ).toMatchInlineSnapshot(
      `"<h1 class="title"></h1><span>Header Text</span><button type="button" class="original-class">Button Text</button>"`
    );
  });

  test('React-style children', () => {
    expect(
      <Header class="title">
        <span>Header Text</span>
      </Header>
    ).toMatchInlineSnapshot(`"<h1 class="title"><span>Header Text</span></h1>"`);

    expect(<Button class="override" />).toMatchInlineSnapshot(
      `"<button type="button" class="override"></button>"`
    );

    expect(<Button>Button Text</Button>).toMatchInlineSnapshot(
      `"<button type="button" class="original-class">Button Text</button>"`
    );

    expect(
      <>
        <AssertChildren expect={undefined} />
        <AssertChildren expect={undefined}></AssertChildren>
        <AssertChildren expect={<div></div>}>
          <div></div>
        </AssertChildren>
        <AssertChildren expect={'1'}>1</AssertChildren>
        <AssertChildren expect={'1 2'}>1 2</AssertChildren>
        <AssertChildren expect={[<div></div>, <div></div>]}>
          <div></div>
          <div></div>
        </AssertChildren>
        <AssertChildren expect={[<div></div>, '1', <div></div>]}>
          <div></div>1<div></div>
        </AssertChildren>
      </>
    ).toMatchInlineSnapshot(
      `"<div></div><div></div><div><div></div></div><div>1</div><div>1 2</div><div><div></div><div></div></div><div><div></div>1<div></div></div>"`
    );
  });

  test('React-style className', () => {
    expect(<div class="a"></div>).toMatchInlineSnapshot(`"<div class="a"></div>"`);
    expect(<div className="c"></div>).toMatchInlineSnapshot(`"<div class="c"></div>"`);
    expect(<div class="b" className="d"></div>).toMatchInlineSnapshot(
      `"<div class="b"></div>"`
    );
    expect(<div className="a" class="b"></div>).toMatchInlineSnapshot(
      `"<div class="b"></div>"`
    );
  });

  test('Reserved `key` attribute', () => {
    function Test({ key }: { key: number }) {
      // ensure the below component call does not passed key
      expect(key).toBe(undefined);

      return (
        <div
          //@ts-expect-error - key is reserved
          key={key}
        ></div>
      );
    }

    expect(
      <Test
        //@ts-expect-error - key is reserved
        key={1}
      />
    ).toMatchInlineSnapshot(`"<div></div>"`);
  });
});
