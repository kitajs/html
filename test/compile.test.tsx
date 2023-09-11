import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

type Props = Html.PropsWithChildren<{ color: string }>

function Component({ color, children }: Props) {
  return (
    <div>
      <div class="a" style={{ color }}></div>
      <div class="b" style={{ color }}></div>
      {children}
    </div>
  )
}

test('compiled component', () => {
  const Compiled = Html.compile(Component)

  assert.equal(
    <Compiled color="red">1</Compiled>,
    '<div><div class="a" style="color:red;"></div><div class="b" style="color:red;"></div>1</div>'
  )
})

test('compiled with children', () => {
  const Compiled =
    Html.compile<Html.PropsWithChildren<{ color: string }>>(Component)

  assert.equal(
    <Compiled color="red">
      <>1</>
      <>2</>
    </Compiled>,
    // Should not complain, just transform to string as any other array [1, 2] => '1,2'
    '<div><div class="a" style="color:red;"></div><div class="b" style="color:red;"></div>1 2</div>'
  )
})

test('compiled component with props', () => {
  const Compiled = Html.compile<Props>(Component)

  assert.equal(
    <Compiled color="red">1</Compiled>,
    '<div><div class="a" style="color:red;"></div><div class="b" style="color:red;"></div>1</div>'
  )
})

test('compiled handmade component', () => {
  const Compiled = Html.compile(({ color, children }: Props) => (
    <div>
      <div class="a" style={{ color }}></div>
      <div class="b" style={{ color }}></div>
      {children}
    </div>
  ))

  assert.equal(
    <Compiled color="red">1</Compiled>,
    '<div><div class="a" style="color:red;"></div><div class="b" style="color:red;"></div>1</div>'
  )
})

test('compiled strict', () => {
  const Compiled = Html.compile(({ color, children }: Props) => (
    <div>
      <div class="a" style={{ color }}></div>
      <div class="b" style={{ color }}></div>
      {children}
    </div>
  ))

  assert.throws(
    //@ts-expect-error - Property color was not provided.
    () => Compiled({}),
    /Error: Property color was not provided./
  )

  assert.throws(
    //@ts-expect-error - Property color was not provided.
    () => Compiled(),
    /Error: The arguments object was not provided./
  )
})

test('compiled not strict', () => {
  const Compiled = Html.compile(
    ({ color, children }: Props) => (
      <div>
        <div class="a" style={{ color }}></div>
        <div class="b" style={{ color }}></div>
        {children}
      </div>
    ),
    false
  )

  assert.doesNotThrow(
    //@ts-expect-error - Property color was not provided.
    Compiled
  )

  assert.equal(
    //@ts-expect-error - Property color was not provided.
    <Compiled></Compiled>,
    '<div><div class="a" style="color:;"></div><div class="b" style="color:;"></div></div>'
  )
})
