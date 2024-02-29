import assert from 'node:assert';
import test, { describe } from 'node:test';
import Html, { compile } from '../index';

type Props = Html.PropsWithChildren<{ color: string }>;

function Component({ color, children }: Props) {
  return (
    <div>
      <div class="a" style={{ color }}></div>
      <div class="b" style={{ color }}></div>
      {children}
    </div>
  );
}

describe('Compiled components', () => {
  test('simple', () => {
    const Compiled = Html.compile(Component);

    assert.equal(
      <Compiled color="red">1</Compiled>,
      '<div><div class="a" style="color:red;"></div><div class="b" style="color:red;"></div>1</div>'
    );
  });

  test('with children', () => {
    const Compiled = Html.compile<Html.PropsWithChildren<{ color: string }>>(Component);

    assert.equal(
      <Compiled color="red">
        <>1</>
        <>2</>
      </Compiled>,
      '<div><div class="a" style="color:red;"></div><div class="b" style="color:red;"></div>12</div>'
    );
  });

  test('with props', () => {
    const Compiled = Html.compile<Props>(Component);

    assert.equal(
      <Compiled color="red">1</Compiled>,
      '<div><div class="a" style="color:red;"></div><div class="b" style="color:red;"></div>1</div>'
    );
  });

  test('handmade component', () => {
    const Compiled = Html.compile(({ color, children }: Props) => (
      <div>
        <div class="a" style={{ color }}></div>
        <div class="b" style={{ color }}></div>
        {children}
      </div>
    ));

    assert.equal(
      <Compiled color="red">1</Compiled>,
      '<div><div class="a" style="color:red;"></div><div class="b" style="color:red;"></div>1</div>'
    );
  });

  test('strict', () => {
    const Compiled = Html.compile(({ color, children }: Props) => (
      <div>
        <div class="a" style={{ color }}></div>
        <div class="b" style={{ color }}></div>
        {children}
      </div>
    ));

    assert.throws(
      //@ts-expect-error - Property color was not provided.
      () => Compiled({}),
      /Error: Property color was not provided./
    );

    assert.throws(
      //@ts-expect-error - Property color was not provided.
      () => Compiled(),
      /Error: The arguments object was not provided./
    );
  });

  test('not strict', () => {
    const Compiled = Html.compile(
      ({ color, children }: Props) => (
        <div>
          <div class="a" style={{ color }}></div>
          <div class="b" style={{ color }}></div>
          {children}
        </div>
      ),
      false
    );

    assert.doesNotThrow(
      //@ts-expect-error - Property color was not provided.
      Compiled
    );

    assert.equal(
      //@ts-expect-error - Property color was not provided.
      <Compiled></Compiled>,
      '<div><div class="a" style="color:;"></div><div class="b" style="color:;"></div></div>'
    );
  });

  test('multiple children', () => {
    const Compiled = Html.compile(({ children }) => <div>{children}</div>);

    assert.equal(
      <Compiled>
        <div>1</div>
        <div>2</div>
      </Compiled>,
      '<div><div>1</div><div>2</div></div>'
    );
  });

  test('validations', () => {
    assert.throws(
      //@ts-expect-error - should complain
      () => compile('not a function'),
      /Error: The first argument must be a function./
    );

    async function AsyncComponent() {
      return <div></div>;
    }

    assert.throws(
      () => compile(AsyncComponent),
      /Error: You cannot use compile\(\) with async components./
    );
  });

  test('escapes backtick', () => {
    const compiled = compile<{ prop: string }>((p) => <div>` {p.prop}</div>);

    assert.equal(compiled({ prop: 'test' }), '<div>` test</div>');
  });
});
