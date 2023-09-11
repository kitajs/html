import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

test('custom tag', () => {
  assert.equal(<tag of="div" attr />, '<div attr></div>')

  assert.equal(<tag of="div" attr></tag>, '<div attr></div>')

  assert.equal(
    <tag of="div" attr>
      1
    </tag>,
    '<div attr>1</div>'
  )

  assert.equal(
    <tag of="div" attr>
      {' '}
    </tag>,
    '<div attr> </div>'
  )
})

test('custom void tag', () => {
  assert.equal(<tag of="link" attr />, '<link attr/>')

  assert.equal(<tag of="link" attr></tag>, '<link attr/>')

  assert.equal(
    <tag of="link" attr>
      1
    </tag>,
    '<link attr>1</link>'
  )

  assert.equal(
    <tag of="link" attr>
      {' '}
    </tag>,
    '<link attr> </link>'
  )

  assert.equal(
    <tag of="my-custom-KEBAB" />,
    '<my-custom-KEBAB></my-custom-KEBAB>'
  )
})
