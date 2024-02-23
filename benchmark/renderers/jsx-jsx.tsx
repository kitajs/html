//@ts-nocheck - disable messing with source types

const { Html } = (await import('../../../index.js')).default;
const { jsx, jsxs } = (await import('../../../jsx-runtime.js')).default;

const big: any = 10347956237904562380n;

export function StandardJsx(name: string) {
  return Html.createElement(
    'div',
    null,
    Html.createElement('div', null, 1),
    Html.createElement('div', null, 123123),
    Html.createElement('div', null, big),
    Html.createElement('div', null, name),
    Html.createElement('div', null, true),
    Html.createElement('div', null, false),
    Html.createElement(
      'div',
      null,
      1,
      123123,
      big,
      name,
      true,
      false,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      'asd',
      null,
      undefined
    ),
    Html.createElement('div', null, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    Html.createElement('div', null, 'asd'),
    Html.createElement('div', null, null),
    Html.createElement('div', null, undefined),
    Html.createElement('div', null, 1),
    Html.createElement('div', null, 123123),
    Html.createElement('div', null, big),
    Html.createElement('div', null, name),
    Html.createElement('div', null, true),
    Html.createElement('div', null, false),
    Html.createElement('div', null, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    Html.createElement('div', null, 'asd'),
    Html.createElement('div', null, null),
    Html.createElement('div', null, undefined),
    Html.createElement(
      'div',
      null,
      1,
      123123,
      big,
      name,
      true,
      false,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      'asd',
      null,
      undefined
    ),
    Html.createElement(
      'div',
      null,
      1,
      123123,
      big,
      name,
      true,
      false,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      'asd',
      null,
      undefined
    )
  );
}

export function ReactJsx(name: string) {
  return jsxs('div', {
    children: [
      jsx('div', { children: 1 }),
      jsx('div', { children: 123123 }),
      jsx('div', { children: big }),
      jsx('div', { children: name }),
      jsx('div', { children: true }),
      jsx('div', { children: false }),
      jsxs('div', {
        children: [
          1,
          123123,
          big,
          name,
          true,
          false,
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          'asd',
          null,
          undefined
        ]
      }),
      jsx('div', { children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }),
      jsx('div', { children: 'asd' }),
      jsx('div', { children: null }),
      jsx('div', { children: undefined }),
      jsx('div', { children: 1 }),
      jsx('div', { children: 123123 }),
      jsx('div', { children: big }),
      jsx('div', { children: name }),
      jsx('div', { children: true }),
      jsx('div', { children: false }),
      jsx('div', { children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }),
      jsx('div', { children: 'asd' }),
      jsx('div', { children: null }),
      jsx('div', { children: undefined }),
      jsxs('div', {
        children: [
          1,
          123123,
          big,
          name,
          true,
          false,
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          'asd',
          null,
          undefined
        ]
      }),
      jsxs('div', {
        children: [
          1,
          123123,
          big,
          name,
          true,
          false,
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          'asd',
          null,
          undefined
        ]
      })
    ]
  });
}

// only for comparison
export const ORIGINAL_TREE = () => (
  <div>
    <div>{1}</div>
    <div>{123123}</div>
    <div>{big}</div>
    <div>{name}</div>
    <div>{true}</div>
    <div>{false}</div>
    <div>
      {1}
      {123123}
      {big}
      {name}
      {true}
      {false}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      {'asd'}
      {null}
      {undefined}
    </div>
    <div>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}</div>
    <div>{'asd'}</div>
    <div>{null}</div>
    <div>{undefined}</div>
    <div>{1}</div>
    <div>{123123}</div>
    <div>{big}</div>
    <div>{name}</div>
    <div>{true}</div>
    <div>{false}</div>
    <div>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}</div>
    <div>{'asd'}</div>
    <div>{null}</div>
    <div>{undefined}</div>
    <div>
      {1}
      {123123}
      {big}
      {name}
      {true}
      {false}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      {'asd'}
      {null}
      {undefined}
    </div>
    <div>
      {1}
      {123123}
      {big}
      {name}
      {true}
      {false}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      {'asd'}
      {null}
      {undefined}
    </div>
  </div>
);
