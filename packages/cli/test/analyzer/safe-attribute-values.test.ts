import { describe, expect, it } from 'vitest'
import { DoubleEscape, UnusedSafe, Xss } from '../../src/errors.js'
import { openWithDiagnostics } from '../util/project.js'

const codes = (diagnostics: { body: { code: number }[] }) =>
  diagnostics.body.map((diagnostic) => diagnostic.code)

describe('safe attribute values', () => {
  it('treats safe={true} like a bare safe attribute', async () => {
    const diagnostics = await openWithDiagnostics /* tsx */ `
      export default (
        <>
          <div safe={true}>{html}</div>
          <div safe={true}>{number}</div>
        </>
      )
    `

    expect(diagnostics.body).toEqual([
      {
        start: { line: 37, offset: 16 },
        end: { line: 37, offset: 27 },
        text: UnusedSafe.message,
        code: UnusedSafe.code,
        category: 'warning'
      }
    ])
  })

  it('does not trust safe={false} or values that are not literally true', async () => {
    const diagnostics = await openWithDiagnostics /* tsx */ `
      const flag = Math.random() > 0.5
      export default (
        <>
          <div safe={false}>{html}</div>
          <div safe={flag}>{html}</div>
          <div safe="true">{html}</div>
        </>
      )
    `

    expect(codes(diagnostics)).toEqual([Xss.code, Xss.code, Xss.code])
  })

  it('reports double escaping with safe={true}', async () => {
    const diagnostics = await openWithDiagnostics /* tsx */ `
      export default <div safe={true}><b>{number}</b></div>
    `

    expect(codes(diagnostics)).toEqual([DoubleEscape.code])
  })
})

describe('unused safe with several children', () => {
  it('does not warn when any child needs escaping', async () => {
    const diagnostics = await openWithDiagnostics /* tsx */ `
      export default (
        <>
          <p safe>{html}{number}</p>
          <p safe>{number}{html}</p>
          <p safe>{number} and {boolean ? number : html}</p>
        </>
      )
    `

    expect(diagnostics.body).toEqual([])
  })

  it('warns when every child is already safe', async () => {
    const diagnostics = await openWithDiagnostics /* tsx */ `
      export default <p safe>{number}{boolean ? 1 : 2}</p>
    `

    expect(codes(diagnostics)).toEqual([UnusedSafe.code])
  })

  it('reports a double escape instead of an unused safe attribute', async () => {
    const diagnostics = await openWithDiagnostics /* tsx */ `
      export default <p safe>{number}<b>{number}</b></p>
    `

    expect(codes(diagnostics)).toEqual([DoubleEscape.code])
  })
})
