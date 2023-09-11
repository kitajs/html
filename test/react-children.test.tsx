import assert from 'node:assert'
import test from 'node:test'
import Html from '../index'

const Header: Html.Component<any> = ({ children, ...attributes }) => (
  <h1 {...attributes}>{children}</h1>
)

function Button({ children, ...attributes }: Html.PropsWithChildren<any>) {
  return (
    <button type="button" class="original-class" {...attributes}>
      {children}
    </button>
  )
}

test('react children', () => {
  assert.equal(
    '<h1 class="title"></h1><span>Header Text</span><button type="button" class="original-class">Button Text</button>',
    <>
      <Header class="title"></Header>
      <span>Header Text</span>
      <Button>Button Text</Button>
    </>
  )
})
