import assert from 'node:assert';
import test, { describe } from 'node:test';

describe('Html structures', () => {
  test('simple html structures', () => {
    assert.equal(<a href="test">a link</a>, '<a href="test">a link</a>');

    assert.equal(
      `<ul><li>1</li><li>2</li></ul>`,
      <ul>
        {[1, 2].map((li) => (
          <li>{li}</li>
        ))}
      </ul>
    );

    assert.equal(
      '<button onclick="doSomething"></button>',
      <button onclick="doSomething"></button>
    );

    assert.equal('<div class="class-a"></div>', <div class="class-a"></div>);

    assert.equal(
      '<script src="jquery.js" integrity="sha256-123=" crossorigin="anonymous"></script>',
      <script src="jquery.js" integrity="sha256-123=" crossorigin="anonymous"></script>
    );
  });

  test('untyped & unknown attributes', () => {
    assert.equal(<a not-href></a>, '<a not-href></a>');
    assert.equal(<c not-href></c>, '<c not-href></c>');
    assert.equal(<c notHref></c>, '<c notHref></c>');
    assert.equal(<c notHref></c>, '<c notHref></c>');

    function D() {
      return <div />;
    }

    // @ts-expect-error - should complain about unknown tag on component and not render it
    assert.equal(<D notHref></D>, '<div></div>');
  });

  test('simple svg structure', () => {
    assert.equal(
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
      </svg>,
      '<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow"></circle></svg>'
    );
  });
});
