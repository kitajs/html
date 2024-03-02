import assert from 'node:assert';
import test, { describe } from 'node:test';
import Html from '../index';

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

function AssertChildren({ children, expect }: Html.PropsWithChildren<{ expect: any }>) {
  assert.deepEqual(children, expect);
  return <div>{children}</div>;
}

describe('React integration', () => {
  test('react children', () => {
    assert.equal(
      '<h1 class="title"></h1><span>Header Text</span><button type="button" class="original-class">Button Text</button>',
      <>
        <Header class="title"></Header>
        <span>Header Text</span>
        <Button>Button Text</Button>
      </>
    );
  });

  test('React-style children', () => {
    assert.equal(
      '<h1 class="title"><span>Header Text</span></h1>',
      <Header class="title">
        <span>Header Text</span>
      </Header>
    );

    assert.equal(
      '<button type="button" class="override"></button>',
      <Button class="override" />
    );

    assert.equal(
      '<button type="button" class="original-class">Button Text</button>',
      <Button>Button Text</Button>
    );

    assert.equal(
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
      </>,
      '<div></div>' +
        '<div></div>' +
        '<div><div></div></div>' +
        '<div>1</div>' +
        '<div>1 2</div>' +
        '<div><div></div><div></div></div>' +
        '<div><div></div>1<div></div></div>'
    );
  });

  test('React-style className', () => {
    assert.equal(<div class="a"></div>, '<div class="a"></div>');
    assert.equal(<div className="c"></div>, '<div class="c"></div>');
    assert.equal(<div class="b" className="d"></div>, '<div class="b"></div>');
    assert.equal(<div className="a" class="b"></div>, '<div class="b"></div>');
  });

  test('Reserved `key` attribute', () => {
    function Test({ key }: { key: number }) {
      // ensure the below component call does not passed key
      assert.equal(key, undefined);

      return (
        <div
          //@ts-expect-error - key is reserved
          key={key}
        ></div>
      );
    }

    assert.equal(
      <Test
        //@ts-expect-error - key is reserved
        key={1}
      />,
      '<div></div>'
    );
  });
});
