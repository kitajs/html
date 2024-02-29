import assert from 'node:assert';
import test, { describe } from 'node:test';
import { prependDoctype } from '../lib/prepend-doctype';

describe('prependDoctype', () => {
  test('prepends doctype to html', () => {
    assert.strictEqual(
      prependDoctype('<html lang="en"></html>'),
      '<!doctype html><html lang="en"></html>'
    );

    assert.strictEqual(prependDoctype('<html></html>'), '<!doctype html><html></html>');

    // keeps single doctype
    assert.strictEqual(
      prependDoctype('<!doctype html><html></html>'),
      '<!doctype html><html></html>'
    );
  });

  test('does not prepends doctype to non html tags', () => {
    assert.strictEqual(prependDoctype('<div></div>'), '<div></div>');

    assert.strictEqual(prependDoctype('<div>Hi</div>'), '<div>Hi</div>');

    assert.strictEqual(
      prependDoctype('<div><div></div></div>'),
      '<div><div></div></div>'
    );

    assert.strictEqual(
      prependDoctype('<div><div>Hi</div></div>'),
      '<div><div>Hi</div></div>'
    );
  });

  test('does not prepends doctype to non html strings', () => {
    assert.strictEqual(prependDoctype('Hi'), 'Hi');

    assert.strictEqual(prependDoctype(''), '');
  });

  test('prepends doctype to html with JSX', () => {
    assert.strictEqual(
      //@ts-expect-error - should fail
      prependDoctype(<html lang="en" />),
      '<!doctype html><html lang="en"></html>'
    );

    assert.strictEqual(
      //@ts-expect-error - should fail
      // biome-ignore lint/a11y/useHtmlLang: this is a test
      prependDoctype(<html />),
      '<!doctype html><html></html>'
    );

    // keeps single doctype
    assert.strictEqual(
      prependDoctype(
        //@ts-expect-error - should fail
        <>
          {'<!doctype html>'}
          {/* biome-ignore lint/a11y/useHtmlLang: this is a test */}
          <html />
        </>
      ),
      '<!doctype html><html></html>'
    );
  });

  test('does not prepends doctype to non html JSX', () => {
    assert.strictEqual(
      //@ts-expect-error - should fail
      prependDoctype(<div />),
      '<div></div>'
    );

    assert.strictEqual(
      //@ts-expect-error - should fail
      prependDoctype(<div>Hi</div>),
      '<div>Hi</div>'
    );

    assert.strictEqual(
      prependDoctype(
        //@ts-expect-error - should fail
        <>
          <div />
          <div>Hi</div>
        </>
      ),
      '<div></div><div>Hi</div>'
    );
  });
});
