import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

test('style property', () => {
  assert.equal(
    <>
      <div style={{ backgroundColor: 'red' }}></div>
      <div style="background-color: blue;"></div>
      <div style="background-color:green;"></div>
    </>,
    '<div style="background-color:red;"></div><div style="background-color: blue;"></div><div style="background-color:green;"></div>'
  )
})
