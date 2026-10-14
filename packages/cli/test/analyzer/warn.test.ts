import { expect, it } from 'vitest'
import { UnusedSafe } from '../../src/errors.js'
import { openWithDiagnostics } from '../util/project.js'

it('Warn on unused `safe` tags', async () => {
  const diagnostics = await openWithDiagnostics /* tsx */ `
    export default (
      <>
        <div safe>
        {number} {safeString}
        </div>
        <div safe>{safeString}</div>
        <div safe>{promiseNumber}</div>
        <div safe> </div>
        <div safe></div>
      </>
    );
`

  expect(diagnostics.body).toEqual([
    {
      start: { line: 36, offset: 14 },
      end: { line: 36, offset: 18 },
      text: UnusedSafe.message,
      code: UnusedSafe.code,
      category: 'warning'
    },
    {
      start: { line: 39, offset: 14 },
      end: { line: 39, offset: 18 },
      text: UnusedSafe.message,
      code: UnusedSafe.code,
      category: 'warning'
    },
    {
      start: { line: 40, offset: 14 },
      end: { line: 40, offset: 18 },
      text: UnusedSafe.message,
      code: UnusedSafe.code,
      category: 'warning'
    },
    {
      start: { line: 41, offset: 14 },
      end: { line: 41, offset: 18 },
      text: UnusedSafe.message,
      code: UnusedSafe.code,
      category: 'warning'
    },
    {
      start: { line: 42, offset: 14 },
      end: { line: 42, offset: 18 },
      text: UnusedSafe.message,
      code: UnusedSafe.code,
      category: 'warning'
    }
  ])
})
