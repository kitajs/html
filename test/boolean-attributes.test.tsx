import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

test('boolean attributes', () => {
  // https://www.w3.org/TR/html5/infrastructure.html#boolean-attributes
  assert.equal('<input checked/>', <input checked={true}></input>)

  assert.equal('<input/>', <input checked={false}></input>)

  assert.equal('<input disabled/>', <input disabled={true}></input>)

  assert.equal('<input/>', <input disabled={false}></input>)

  assert.equal(
    '<p draggable spellcheck hidden translate></p>',
    <p draggable spellcheck hidden translate></p>
  )

  assert.equal(
    '<p></p>',
    <p
      draggable={false}
      spellcheck={false}
      hidden={false}
      translate={false}></p>
  )

  assert.equal('<form novalidate></form>', <form novalidate></form>)
})
