import assert from 'node:assert';
import test, { describe } from 'node:test';
import { isHtml } from '../lib/is-html';

describe('isHtml', () => {
  test('detects html', () => {
    assert.ok(isHtml('<h1>Hi</h1>'));
    assert.ok(isHtml('<html></html>'));
    assert.ok(isHtml('<!doctype html>'));
    assert.ok(isHtml('<!DOCTYPE html>'));
    assert.ok(isHtml('<html lang="en"></html>'));
    assert.ok(isHtml('<html></html><h1>Hi</h1>'));
    assert.ok(isHtml('<!doctype html><h1>Hi</h1>'));
    assert.ok(isHtml('<!DOCTYPE html><h1>Hi</h1>'));
    assert.ok(isHtml('<html lang="en"><h1>Hi</h1></html>'));
  });

  test('trims html', () => {
    assert.ok(isHtml('   <h1>Hi</h1>    '));
    assert.ok(isHtml(' \n   \n\n  <h1>Hi</h1> \n\n    \n   \n   '));
  });

  test('detects html with JSX', () => {
    assert.ok(isHtml(<h1>Hi</h1>));
    // biome-ignore lint/a11y/useHtmlLang: this is a test
    assert.ok(isHtml(<html />));
    assert.ok(isHtml(<html lang="en" />));
    assert.ok(
      isHtml(
        <>
          <html lang="en" />
          <h1>Hi</h1>
        </>
      )
    );
    assert.ok(
      isHtml(
        <html lang="en">
          <h1>Hi</h1>
        </html>
      )
    );
  });

  test('does not detects html on non strings', () => {
    // biome-ignore lint/suspicious/noExplicitAny: to ignore type errors
    const anyIsHtml: any = isHtml;

    assert.ok(!anyIsHtml());
    assert.ok(!anyIsHtml(undefined));
    assert.ok(!anyIsHtml(null));
    assert.ok(!anyIsHtml(0));
    assert.ok(!anyIsHtml(1));
    assert.ok(!anyIsHtml({ a: 1 }));
    assert.ok(!anyIsHtml({ html: '<div></div>' }));
    assert.ok(!anyIsHtml([]));
    assert.ok(!anyIsHtml(true));
    assert.ok(!anyIsHtml(false));
  });

  test('does not detects html on non html strings', () => {
    assert.ok(!isHtml(''));
    assert.ok(!isHtml('Hi'));
    assert.ok(!isHtml('Hi <h1>Hi</h1>'));
    assert.ok(!isHtml('<h1>Hi</h1> Hi'));
    assert.ok(!isHtml('<h1> invalid <h1'));
    assert.ok(!isHtml('h1> invalid <h1>'));
  });
});
