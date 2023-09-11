import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

test('falsy values', () => {
  assert.equal(
    <>
      {false}
      {null}
      {undefined}
      {0}
      {NaN}
      {true}
      false null undefined 0 NaN true
    </>,
    '0true' + 'false null undefined 0 NaN true'
  )

  assert.equal(
    <div
      id="truthy"
      hidden={false}
      spellcheck={true}
      translate={undefined}></div>,
    '<div id="truthy" spellcheck></div>'
  )
})
