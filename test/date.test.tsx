import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

test('using a Date type attribute', () => {
  assert.equal(
    '<time datetime="1914-12-20T08:00:00.000Z"></time>',
    <time datetime={new Date('1914-12-20T08:00+0000')}></time>
  )

  assert.equal(
    '<ins datetime="1914-12-20T08:00:00.000Z">new</ins>',
    <ins datetime={new Date('1914-12-20T08:00+0000')}>new</ins>
  )

  assert.equal(
    '<del datetime="1914-12-20T08:00:00.000Z">old</del>',
    <del datetime={new Date('1914-12-20T08:00+0000')}>old</del>
  )

  assert.equal(
    '<time datetime="1914-12-20T08:00:00.000Z"></time>',
    <time datetime={new Date('1914-12-20T08:00+0000').toISOString()}></time>
  )

  assert.equal(
    '<ins datetime="1914-12-20T08:00:00.000Z">new</ins>',
    <ins datetime={new Date('1914-12-20T08:00+0000').toISOString()}>new</ins>
  )

  assert.equal(
    '<del datetime="1914-12-20T08:00:00.000Z">old</del>',
    <del datetime={new Date('1914-12-20T08:00+0000').toISOString()}>old</del>
  )
})
