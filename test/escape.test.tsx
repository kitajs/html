import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

const unsafeTag = '<script tag="1">alert(1)</script>'
const safeTag = Html.escapeHtml(unsafeTag)

test('escapes content', () => {
  assert.equal(<>{unsafeTag}</>, <>{unsafeTag}</>)
})

test('with children', () => {
  assert.equal(
    <>
      <div>{unsafeTag}</div>
    </>,
    <>
      <div>{unsafeTag}</div>
    </>
  )
})

test('escapes children', () => {
  assert.equal(
    <>
      <div safe>{unsafeTag}</div>
    </>,
    <>
      <div>{safeTag}</div>
    </>
  )
})

test('escapes deep children', () => {
  assert.equal(
    <>
      <div safe>
        <div>{unsafeTag}</div>
      </div>
    </>,
    <>
      <div>{Html.escapeHtml(<div>{unsafeTag}</div>)}</div>
    </>
  )
})

test('always escapes attributes', () => {
  assert.equal(
    <>
      <div style={'"&<>\''}></div>
      <div style={{ backgroundColor: '"&<>\'' }}></div>
      <div class={'"&<>\''}></div>
    </>,
    <>
      <div style="&#34;&amp;&lt;&gt;&#39;"></div>
      <div style="background-color:&#34;&amp;&lt;&gt;&#39;;"></div>
      <div class="&#34;&amp;&lt;&gt;&#39;"></div>
    </>
  )

  assert.equal(
    <>
      <div style={'"&<>\''}></div>
      <div style={{ backgroundColor: '"&<>\'' }}></div>
      <div class={'"&<>\''}></div>
    </>,
    `<div style="&#34;&amp;&lt;&gt;&#39;"></div><div style="background-color:&#34;&amp;&lt;&gt;&#39;;"></div><div class="&#34;&amp;&lt;&gt;&#39;"></div>`
  )
})

test('always escapeHtml', () => {
  const date = new Date()

  assert.equal(Html.escapeHtml(date), date.toISOString())
  assert.equal(Html.escapeHtml(null), 'null')
  assert.equal(Html.escapeHtml(undefined), 'undefined')
  assert.equal(Html.escapeHtml(true), 'true')
  assert.equal(Html.escapeHtml(false), 'false')
  assert.equal(Html.escapeHtml(0), '0')
  assert.equal(Html.escapeHtml(1), '1')
  assert.equal(Html.escapeHtml(1.1), '1.1')
  assert.equal(Html.escapeHtml(''), '')
  assert.equal(Html.escapeHtml('string'), 'string')
  assert.equal(Html.escapeHtml([]), '')
  assert.equal(Html.escapeHtml([1, 2, 3]), '1,2,3')
  assert.equal(Html.escapeHtml({}), '[object Object]')
})
