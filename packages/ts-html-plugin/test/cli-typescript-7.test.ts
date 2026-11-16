import { expect, it, vi } from 'vitest'
import { main } from '../src/cli'

// On TypeScript 7, require('typescript') only exposes the version. vi.mock is hoisted
// above the imports.
vi.mock('typescript', () => ({
  default: { version: '7.0.2', versionMajorMinor: '7.0' }
}))

it('points to kita-html check when TypeScript has no compiler API', async () => {
  const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never)
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})

  await main()

  expect(exit).toHaveBeenCalledWith(1)
  expect(error).toHaveBeenCalledWith(
    expect.stringContaining('TypeScript 7.0.2 has no compiler API')
  )
  expect(error).toHaveBeenCalledWith(expect.stringContaining('kita-html check'))
})
