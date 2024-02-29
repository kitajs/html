import assert from 'node:assert';
import test, { describe } from 'node:test';
import HtmlModule from '../index';

describe('Global instance', () => {
  test('registers Html to the global namespace', async () => {
    // This should not be defined yet
    assert.equal(typeof Html, 'undefined');

    // Avoids printing warnings
    const previous = process.env.NODE_NO_WARNINGS;
    process.env.NODE_NO_WARNINGS = '1';

    // Adds Html to the global namespace
    await import('../register');

    process.env.NODE_NO_WARNINGS = previous;

    // Literally the same object
    assert.equal(typeof Html, 'object');
    assert.ok(Html === HtmlModule);

    // @ts-expect-error - Delete globalThis to test that it is added
    delete globalThis.Html;

    // Should be the same as the start of this test
    assert.equal(typeof Html, 'undefined');
  });
});
