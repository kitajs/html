import { describe, expect, test } from 'vitest';
import * as Html from '../src/index.js';

const Header: Html.Component<any> = ({ children, ...attributes }) => (
  <h1 {...attributes}>{children}</h1>
);

function Button(attributes: Html.PropsWithChildren<any>) {
  return (
    <button type="button" class="original-class" {...attributes}>
      {attributes.children}
    </button>
  );
}

describe('Components', () => {
  test('helper components', () => {
    expect(
      <Header class="title">
        <span>Header Text</span>
      </Header>
    ).toMatchInlineSnapshot(`"<h1 class="title"><span>Header Text</span></h1>"`);

    expect(<Button class="override" test="a" b={3} />).toMatchInlineSnapshot(
      `"<button type="button" class="override" test="a" b="3"></button>"`
    );

    expect(<Button>Button Text</Button>).toMatchInlineSnapshot(
      `"<button type="button" class="original-class">Button Text</button>"`
    );
  });
});
