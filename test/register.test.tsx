import HtmlModule from '../index'
import assert from 'node:assert'
import test from 'node:test'

test('Register adds Html to the global namespace', async () => {
  // This should not be defined yet
  assert.equal(typeof Html, 'undefined')

  // Adds Html to the global namespace
  await import('../register')

  // Literally the same object
  assert.equal(typeof Html, 'object')
  assert.ok(Html === HtmlModule)

  // @ts-expect-error - Delete globalThis to test that it is added
  delete globalThis.Html

  // Should be the same as the start of this test
  assert.equal(typeof Html, 'undefined')
})
