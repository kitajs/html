import { AutoSuspense, Suspense, SuspenseRoot } from '@kitajs/html/suspense'
import { H3 } from 'h3'
import { setTimeout } from 'node:timers/promises'
import { afterEach, describe, expect, test } from 'vitest'
import { defineKitaHandler, h3KitaHtml } from '../src/index.js'

afterEach(() => {
  expect(SuspenseRoot.requests.size).toBe(0)
  SuspenseRoot.requests.clear()
})

describe('event.html()', () => {
  test('renders buffered sync and async HTML', async () => {
    const app = new H3().register(h3KitaHtml())
    app.get('/sync', (event) => event.html(<div>sync</div>))
    app.get('/async', (event) => event.html(<div>{Promise.resolve('async')}</div>))

    const sync = await app.fetch(new Request('http://localhost/sync'))
    const async = await app.fetch(new Request('http://localhost/async'))

    expect(await sync.text()).toBe('<div>sync</div>')
    expect(sync.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(sync.headers.get('content-length')).toBe('15')
    expect(await async.text()).toBe('<div>async</div>')
  })

  test('adds a doctype to HTML roots', async () => {
    const app = new H3().register(h3KitaHtml())
    app.get('/', (event) =>
      event.html(
        <html>
          <body>page</body>
        </html>
      )
    )

    expect(await (await app.fetch(new Request('http://localhost/'))).text()).toBe(
      '<!doctype html><html><body>page</body></html>'
    )
  })

  test('streams explicit Suspense', async () => {
    const app = new H3().register(h3KitaHtml())
    app.get('/', (event) =>
      event.html(
        <Suspense rid={event.context.kitaHtml!.requestId} fallback="loading">
          {setTimeout(1, 'loaded')}
        </Suspense>
      )
    )

    const html = await (await app.fetch(new Request('http://localhost/'))).text()
    expect(html).toContain('data-sf')
    expect(html).toContain('loaded')
  })
})

describe('defineKitaHandler()', () => {
  test('uses H3 error handling for synchronous render errors', async () => {
    const handler = defineKitaHandler(() => {
      throw new Error('render failed')
    })

    const response = await handler.fetch('/')
    expect(response.status).toBe(500)
    expect(SuspenseRoot.requests.size).toBe(0)
  })

  test('rejects a duplicate active request id without replacing its state', async () => {
    const child = Promise.withResolvers<string>()
    const handler = defineKitaHandler(
      () => <AutoSuspense fallback="loading">{child.promise}</AutoSuspense>,
      { genRequestId: () => 'shared' }
    )
    const first = await handler.fetch('/')

    await expect(handler.fetch('/')).resolves.toMatchObject({ status: 500 })
    expect(SuspenseRoot.requests.has('shared')).toBe(true)

    child.resolve('loaded')
    expect(await first.text()).toContain('loaded')
  })

  test('forwards delayed boundary failures to the response stream', async () => {
    const handler = defineKitaHandler(async () => {
      await setTimeout(1)
      return (
        <AutoSuspense fallback="loading">
          {Promise.reject(new Error('boundary failed'))}
        </AutoSuspense>
      )
    })

    const response = await handler.fetch('/')
    await expect(response.text()).rejects.toThrow('boundary failed')
  })

  test('supports AutoSuspense created after an async root yields', async () => {
    const handler = defineKitaHandler(async () => {
      await setTimeout(1)
      return <AutoSuspense fallback="loading">{setTimeout(1, 'loaded')}</AutoSuspense>
    })

    const html = await (await handler.fetch('/')).text()
    expect(html.indexOf('data-sf')).toBeLessThan(html.indexOf('data-sr'))
    expect(html).toContain('loaded')
  })

  test('isolates concurrent requests', async () => {
    const handler = defineKitaHandler((event) => (
      <AutoSuspense fallback={event.url.searchParams.get('name')!}>
        {setTimeout(1, event.url.searchParams.get('name')!)}
      </AutoSuspense>
    ))

    const [a, b] = await Promise.all([
      handler.fetch('/?name=a').then((response) => response.text()),
      handler.fetch('/?name=b').then((response) => response.text())
    ])

    expect(a).toContain('a')
    expect(a).not.toContain('>b<')
    expect(b).toContain('b')
    expect(b).not.toContain('>a<')
  })
})
