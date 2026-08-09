import { expect, it } from 'vitest'
import { Xss } from '../src/errors'
import { TSLangServer } from './util/lang-server'

it('Lists and arrays can be used normally', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    const list: JSX.Element[] = [];

    export default (
      <>
        <div>{list}</div>
      </>
    );
`

  expect(diagnostics.body).toEqual([])
})

it('array literals mixing raw strings with JSX are flagged', async () => {
  await using server = new TSLangServer(__dirname)

  // The whole array literal must be diagnosed even when a JSX sibling is present,
  // since the string member is rendered raw at runtime.
  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    export default <div>{[html, <br />]}</div>;
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 34, offset: 22 },
      end: { line: 34, offset: 36 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})

it('spread children holding raw strings are flagged', async () => {
  await using server = new TSLangServer(__dirname)

  const diagnostics = await server.openWithDiagnostics /* tsx */ `
    const items = [html];

    export default <div>{...items}</div>;
  `

  expect(diagnostics.body).toEqual([
    {
      start: { line: 36, offset: 29 },
      end: { line: 36, offset: 34 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})
