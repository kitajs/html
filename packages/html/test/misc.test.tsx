/// <reference path="../htmx.d.ts" />

import assert from 'node:assert';
import test, { describe } from 'node:test';

describe('Miscellaneous', () => {
  test('Htmx properties', () => {
    assert.equal(
      //@ts-expect-error - should warn about invalid property
      <div
        //
        hx-boost
        hx-headers
      ></div>,
      '<div hx-boost hx-headers></div>'
    );

    assert.equal(<div hx-boost></div>, '<div hx-boost></div>');
    assert.equal(<div hx-target="find "></div>, '<div hx-target="find "></div>');
  });

  test('Primitive values renders exactly like React', () => {
    assert.equal(<div>{false}</div>, <div></div>);
    assert.equal(<div>{null}</div>, <div></div>);
    assert.equal(<div>{undefined}</div>, <div></div>);
    assert.equal(<div>{0}</div>, <div>0</div>);
    assert.equal(<div>{432}</div>, <div>432</div>);
    assert.equal(<div>{NaN}</div>, <div>NaN</div>);
    assert.equal(<div>{true}</div>, <div></div>);
    assert.equal(<div>{Infinity}</div>, <div>Infinity</div>);
    assert.equal(<div>{-Infinity}</div>, <div>-Infinity</div>);
    assert.equal(<div>{[1, 2, 3]}</div>, <div>123</div>);

    assert.equal(
      <div>
        {false}
        {false}
      </div>,
      <div></div>
    );
    assert.equal(
      <div>
        {null}
        {null}
      </div>,
      <div></div>
    );
    assert.equal(
      <div>
        {undefined}
        {undefined}
      </div>,
      <div></div>
    );
    assert.equal(
      <div>
        {0}
        {0}
      </div>,
      <div>00</div>
    );
    assert.equal(
      <div>
        {432}
        {432}
      </div>,
      <div>432432</div>
    );
    assert.equal(
      <div>
        {NaN}
        {NaN}
      </div>,
      <div>NaNNaN</div>
    );
    assert.equal(
      <div>
        {true}
        {true}
      </div>,
      <div></div>
    );
    assert.equal(
      <div>
        {Infinity}
        {Infinity}
      </div>,
      <div>InfinityInfinity</div>
    );
    assert.equal(
      <div>
        {-Infinity}
        {-Infinity}
      </div>,
      <div>-Infinity-Infinity</div>
    );
    assert.equal(
      <div>
        {[1, 2, 3]}
        {[1, 2, 3]}
      </div>,
      <div>123123</div>
    );

    // Bigint is the only case where it differs from React.
    // where React renders a empty string and we render the whole number.
    assert.equal(<div>{123456789123456789n}</div>, <div>123456789123456789</div>);
    assert.equal(<>{123456789123456789n}</>, <>123456789123456789</>);
  });

  test('Rendering objects throws', () => {
    assert.throws(
      //@ts-expect-error - should warn about invalid child
      () => <div>{{}}</div>,
      /Objects are not valid as a KitaJSX child/
    );

    assert.throws(
      //@ts-expect-error - should warn about invalid child
      () => (
        <div>
          {{}} {{}}
        </div>
      ),
      /Objects are not valid as a KitaJSX child/
    );
  });

  test('Events', () => {
    assert.equal(
      '<div onclick="click" onmouseover="mouseover" ondrag="ondrag"></div>',
      <div onclick="click" onmouseover="mouseover" ondrag="ondrag"></div>
    );

    assert.equal(
      '<form onfocus="focus"><input onblur="blur"/></form>',
      <form onfocus="focus">
        <input onblur="blur"></input>
      </form>
    );

    assert.equal(
      '<video onabort="abort" onseeking="seeking"></video>',
      <video onabort="abort" onseeking="seeking"></video>
    );
  });
});
