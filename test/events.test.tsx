import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

test('events', () => {
  assert.equal(
    '<div onclick="click" onmouseover="mouseover" ondrag="ondrag"></div>',
    <div onclick="click" onmouseover="mouseover" ondrag="ondrag"></div>
  )

  assert.equal(
    '<form onfocus="focus"><input onblur="blur"/></form>',
    <form onfocus="focus">
      <input onblur="blur"></input>
    </form>
  )

  assert.equal(
    '<video onabort="abort" onseeking="seeking"></video>',
    <video onabort="abort" onseeking="seeking"></video>
  )
})
