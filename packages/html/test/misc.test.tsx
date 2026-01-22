import { describe, expect, test } from 'vitest';

describe('Miscellaneous', () => {
  test('Htmx properties', () => {
    expect(<div hx-boost hx-headers></div>).toMatchInlineSnapshot(
      `"<div hx-boost hx-headers></div>"`
    );

    expect(<div hx-boost></div>).toMatchInlineSnapshot(`"<div hx-boost></div>"`);
    expect(<div hx-target="find "></div>).toMatchInlineSnapshot(
      `"<div hx-target="find "></div>"`
    );
  });

  test('Primitive values renders exactly like React', () => {
    expect(<div>{false}</div>).toMatchInlineSnapshot(`"<div></div>"`);
    expect(<div>{null}</div>).toMatchInlineSnapshot(`"<div></div>"`);
    expect(<div>{undefined}</div>).toMatchInlineSnapshot(`"<div></div>"`);
    expect(<div>{0}</div>).toMatchInlineSnapshot(`"<div>0</div>"`);
    expect(<div>{432}</div>).toMatchInlineSnapshot(`"<div>432</div>"`);
    expect(<div>{NaN}</div>).toMatchInlineSnapshot(`"<div>NaN</div>"`);
    expect(<div>{true}</div>).toMatchInlineSnapshot(`"<div></div>"`);
    expect(<div>{Infinity}</div>).toMatchInlineSnapshot(`"<div>Infinity</div>"`);
    expect(<div>{-Infinity}</div>).toMatchInlineSnapshot(`"<div>-Infinity</div>"`);
    expect(<div>{[1, 2, 3]}</div>).toMatchInlineSnapshot(`"<div>123</div>"`);

    expect(
      <div>
        {false}
        {false}
      </div>
    ).toMatchInlineSnapshot(`"<div></div>"`);
    expect(
      <div>
        {null}
        {null}
      </div>
    ).toMatchInlineSnapshot(`"<div></div>"`);
    expect(
      <div>
        {undefined}
        {undefined}
      </div>
    ).toMatchInlineSnapshot(`"<div></div>"`);
    expect(
      <div>
        {0}
        {0}
      </div>
    ).toMatchInlineSnapshot(`"<div>00</div>"`);
    expect(
      <div>
        {432}
        {432}
      </div>
    ).toMatchInlineSnapshot(`"<div>432432</div>"`);
    expect(
      <div>
        {NaN}
        {NaN}
      </div>
    ).toMatchInlineSnapshot(`"<div>NaNNaN</div>"`);
    expect(
      <div>
        {true}
        {true}
      </div>
    ).toMatchInlineSnapshot(`"<div></div>"`);
    expect(
      <div>
        {Infinity}
        {Infinity}
      </div>
    ).toMatchInlineSnapshot(`"<div>InfinityInfinity</div>"`);
    expect(
      <div>
        {-Infinity}
        {-Infinity}
      </div>
    ).toMatchInlineSnapshot(`"<div>-Infinity-Infinity</div>"`);
    expect(
      <div>
        {[1, 2, 3]}
        {[1, 2, 3]}
      </div>
    ).toMatchInlineSnapshot(`"<div>123123</div>"`);

    // Bigint is the only case where it differs from React.
    // where React renders a empty string and we render the whole number.
    expect(<div>{123456789123456789n}</div>).toMatchInlineSnapshot(
      `"<div>123456789123456789</div>"`
    );
    expect(<>{123456789123456789n}</>).toMatchInlineSnapshot(`"123456789123456789"`);
  });

  test('Rendering objects throws', () => {
    expect(
      //@ts-expect-error - should warn about invalid child
      () => <div>{{}}</div>
    ).toThrow(/Objects are not valid as a KitaJSX child/);

    expect(
      //prettier-ignore
      //@ts-expect-error - should warn about invalid child
      () => (<div>{{}} {{}}</div>)
    ).toThrow(/Objects are not valid as a KitaJSX child/);
  });

  test('Events', () => {
    expect(
      <div onclick="click" onmouseover="mouseover" ondrag="ondrag"></div>
    ).toMatchInlineSnapshot(
      `"<div onclick="click" onmouseover="mouseover" ondrag="ondrag"></div>"`
    );

    expect(
      <form onfocus="focus">
        <input onblur="blur"></input>
      </form>
    ).toMatchInlineSnapshot(`"<form onfocus="focus"><input onblur="blur"/></form>"`);

    expect(<video onabort="abort" onseeking="seeking"></video>).toMatchInlineSnapshot(
      `"<video onabort="abort" onseeking="seeking"></video>"`
    );
  });
});
