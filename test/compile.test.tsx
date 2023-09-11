import assert from 'node:assert'
import test from 'node:test'
import html, { PropsWithChildren } from '../index'

// const Header: html.Component<{ paramName: string }> = ({
//   children,
//   paramName
// }) => <h1 class={`$parameterOne $${paramName}`}>{children}</h1>

// function Button({ children }: html.PropsWithChildren) {
//   return (
//     <button type="button" class="$test-color">
//       {children}
//     </button>
//   )
// }

// const template = html.compile<['parameterOne', 'p3a', 'test', 'last']>(
//   <>
//     <Header paramName="p3a"></Header>
//     <span>Header ` ` \````Text</span>
//     <Button>Button Text</Button>
//     $last $notFound
//   </>
// )

// test('compile', () => {
//   // raw
//   assert.equal(
//     template({ parameterOne: '123', p3a: 321, test: 'red', last: 1 }),
//     '<h1 class="123 321"></h1><span>Header ` ` \\````Text</span><button type="button" class="red-color">Button Text</button>1 $notFound'
//   )

//   // same output as non-compiled
//   assert.equal(
//     template({ parameterOne: '123', p3a: 321, test: 'cyan', last: 1 }),
//     <>
//       <h1 class="123 321"></h1>
//       <span>Header ` ` \````Text</span>
//       <button type="button" class="cyan-color">
//         Button Text
//       </button>
//       1 $notFound
//     </>
//   )
// })

type Props = PropsWithChildren<{ color: string }>

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
  const Compiled = html.compile(Component)

  assert.equal(
    <Compiled color="red">1</Compiled>,
    '<div><div class="a" style="color:red;"></div><div class="b" style="color:red;"></div>1</div>'
  )
})

test('compiled component with props', () => {
  const Compiled = html.compile(Component)

  assert.equal(
    <Compiled color="red">1</Compiled>,
    '<div><div class="a" style="color:red;"></div><div class="b" style="color:red;"></div>1</div>'
  )
})

test('compiled handmade component', () => {
  const Compiled = html.compile(({ color, children }: Props) => (
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
  const Compiled = html.compile(({ color, children }: Props) => (
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
  const Compiled = html.compile(
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
