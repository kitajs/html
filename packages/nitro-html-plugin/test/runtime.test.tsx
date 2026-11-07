import { AutoSuspense, SuspenseRoot } from '@kitajs/html/suspense'
import { setTimeout } from 'node:timers/promises'
import { afterEach, expect, test } from 'vitest'
import { createPageHandler } from '../src/runtime.js'

afterEach(() => {
  expect(SuspenseRoot.requests.size).toBe(0)
})

test('renders pages with automatic Suspense', async () => {
  const handler = createPageHandler(
    async () => {
      await setTimeout(1)
      return <AutoSuspense fallback="loading">{setTimeout(1, 'loaded')}</AutoSuspense>
    },
    { autoDoctype: true }
  )

  const html = await (await handler.fetch('/')).text()
  expect(html.indexOf('data-sf')).toBeLessThan(html.indexOf('data-sr'))
})

test('limits renderer methods', async () => {
  const handler = createPageHandler(() => <div>fallback</div>, {
    autoDoctype: true,
    renderer: true
  })

  const response = await handler.fetch(
    new Request('http://localhost/', { method: 'POST' })
  )
  expect(response.status).toBe(405)
  expect(response.headers.get('allow')).toBe('GET, HEAD')
})
