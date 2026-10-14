import { expect, it } from 'vitest'
import { Xss } from '../../src/errors.js'
import { openWithDiagnostics } from '../util/project.js'

it('Ensures readme checks will throw error', async () => {
  const diagnostics = await openWithDiagnostics /* tsx */ `
    export default (
      <>
        <div>{String.name}</div>
      </>
    );
`

  expect(diagnostics.body).toEqual([
    {
      category: 'error',
      code: Xss.code,
      end: { line: 36, offset: 26 },
      start: { line: 36, offset: 15 },
      text: Xss.message
    }
  ])
})
