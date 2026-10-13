import { expect, it } from 'vitest'
import { Xss } from '../../src/errors.js'
import { openWithDiagnostics } from '../util/project.js'

it('Detect xss prone usage', async () => {
  const diagnostics = await openWithDiagnostics /* tsx */ `
    export default (
      <>
        <div>
        <div>{html}</div>
        <div>{union}</div>
        <div>
          {['a', 'b', 'c'].map((i) => (
            <>{i}</>
          ))}
          {['a', 'b', 'c'].map((i) => (
            <div>{i}</div>
          ))}
          {['a', 'b', 'c'].map((e) => (
            <div>{e}</div>
          ))}
        </div>
        <div>{['a', 'b', 'c'].map((i) => i)}</div>
        <div>{['a', 'b', 'c'].map((safeI) => safeI)}</div>
      </div>
      </>
    );
`

  expect(diagnostics.body).toEqual([
    {
      start: { line: 37, offset: 15 },
      end: { line: 37, offset: 19 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 38, offset: 15 },
      end: { line: 38, offset: 20 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 41, offset: 16 },
      end: { line: 41, offset: 17 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 44, offset: 19 },
      end: { line: 44, offset: 20 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 47, offset: 19 },
      end: { line: 47, offset: 20 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 50, offset: 15 },
      end: { line: 50, offset: 44 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    },
    {
      start: { line: 51, offset: 15 },
      end: { line: 51, offset: 52 },
      text: Xss.message,
      code: Xss.code,
      category: 'error'
    }
  ])
})
