import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

test('self-closing html tags', () => {
  assert.equal('<area/>', <area></area>)

  assert.equal('<hr/>', <hr></hr>)

  assert.equal('<hr>content</hr>', <hr>content</hr>)

  assert.equal('<meta charset="utf8"/>', <meta charset="utf8"></meta>)

  assert.equal('<video autoplay></video>', <video autoplay=""></video>)

  assert.equal(
    '<video autoplay="test"></video>',
    <video autoplay="test"></video>
  )
})
