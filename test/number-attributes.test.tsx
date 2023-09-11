import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

test('using a number attribute', () => {
  assert.equal(
    '<ol start="1"><li value="2">2</li></ol>',
    <ol start={1}>
      <li value={2}>2</li>
    </ol>
  )

  assert.equal(
    '<meter value="2" min="1" max="3" low="0" high="5" optimum="3"></meter>',
    <meter value={2} min={1} max={3} low={0} high={5} optimum={3}></meter>
  )

  assert.equal(
    '<progress value="2" max="5"></progress>',
    <progress value={2} max={5}></progress>
  )

  assert.equal(
    '<td colspan="2" rowspan="5"></td>',
    <td colspan={2} rowspan={5}></td>
  )

  assert.equal(
    '<th colspan="2" rowspan="5"></th>',
    <th colspan={2} rowspan={5}></th>
  )
})
