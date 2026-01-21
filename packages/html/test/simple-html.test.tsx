import { describe, expect, test } from 'vitest';

describe('Html structures', () => {
  test('simple html structures', () => {
    expect(<a href="test">a link</a>).toMatchInlineSnapshot(
      `"<a href="test">a link</a>"`
    );

    expect(
      <ul>
        {[1, 2].map((li) => (
          <li>{li}</li>
        ))}
      </ul>
    ).toMatchInlineSnapshot(`"<ul><li>1</li><li>2</li></ul>"`);

    expect(<button onclick="doSomething"></button>).toMatchInlineSnapshot(
      `"<button onclick="doSomething"></button>"`
    );

    expect(<div class="class-a"></div>).toMatchInlineSnapshot(
      `"<div class="class-a"></div>"`
    );

    expect(
      <script src="jquery.js" integrity="sha256-123=" crossorigin="anonymous"></script>
    ).toMatchInlineSnapshot(
      `"<script src="jquery.js" integrity="sha256-123=" crossorigin="anonymous"></script>"`
    );
  });

  test('untyped & unknown attributes', () => {
    expect(<a not-href></a>).toMatchInlineSnapshot(`"<a not-href></a>"`);
    //@ts-expect-error - should allow unknown attributes
    expect(<c not-href></c>).toMatchInlineSnapshot(`"<c not-href></c>"`);
    //@ts-expect-error - should allow unknown attributes
    expect(<c notHref></c>).toMatchInlineSnapshot(`"<c notHref></c>"`);
    //@ts-expect-error - should allow unknown attributes
    expect(<c notHref></c>).toMatchInlineSnapshot(`"<c notHref></c>"`);

    function D() {
      return <div />;
    }

    // @ts-expect-error - should complain about unknown tag on component and not render it
    expect(<D notHref></D>).toMatchInlineSnapshot(`"<div></div>"`);
  });

  test('simple svg structure', () => {
    expect(
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
      </svg>
    ).toMatchInlineSnapshot(
      `"<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow"></circle></svg>"`
    );
  });
});
