import express from 'express'
import { setImmediate } from 'node:timers/promises'
import { describe, expect, test } from 'vitest'
import { expressKitaHtml } from '../src'
import { getServerUrl, startServer } from './server'

describe('res.html()', () => {
  test('renders html', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (_, res) => res.html(<div>Hello from JSX!</div>))

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(await res.text()).toBe('<div>Hello from JSX!</div>')
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(res.status).toBe(200)
  })

  test('renders async html', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (_, res) =>
      res.html(<div safe>{setImmediate('Hello from async JSX!')}</div>)
    )

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(await res.text()).toBe('<div>Hello from async JSX!</div>')
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(res.status).toBe(200)
  })

  test('generates Fastify-style request ids by default', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (req, res) => {
      res.json({ id: req.id })
    })

    await using server = await startServer(app)
    const url = `${getServerUrl(server)}/`

    const first = await fetch(url)
    const second = await fetch(url)

    expect(await first.json()).toEqual({ id: 'req-1' })
    expect(await second.json()).toEqual({ id: 'req-2' })
  })

  test('preserves an existing request id', async () => {
    const app = express()

    app.use((req, _res, next) => {
      req.id = 'custom-id'
      next()
    })

    app.use(expressKitaHtml())

    app.get('/', (req, res) => {
      res.json({ id: req.id })
    })

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(await res.json()).toEqual({ id: 'custom-id' })
  })

  test('can disable request id assignment', async () => {
    const app = express()
    app.use(expressKitaHtml({ disableRequestId: true }))

    app.get('/', (req, res) => {
      res.json({ hasId: 'id' in req, id: req.id ?? null })
    })

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(await res.json()).toEqual({ hasId: false, id: null })
  })

  test('works with disableRequestId when another middleware sets req.id', async () => {
    const app = express()

    app.use((req, _res, next) => {
      req.id = 'external-id'
      next()
    })

    app.use(expressKitaHtml({ disableRequestId: true }))

    app.get('/', (req, res) => {
      res.json({ id: req.id })
    })

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(await res.json()).toEqual({ id: 'external-id' })
  })

  test('fails when html is not a string', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (_, res) => {
      // @ts-expect-error - should fail
      res.html(12345)
    })

    app.use(
      (
        error: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
      ) => {
        res.status(500).json({ error: error.name, message: error.message })
      }
    )

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(res.status).toBe(500)
    expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8')
    expect(await res.json()).toEqual({
      error: 'TypeError',
      message:
        'The "string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received type number (12345)'
    })
  })

  test('fails when html is not a string (promise)', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', async (_, res) => {
      // @ts-expect-error - should fail
      await res.html(Promise.resolve(12345))
    })

    app.use(
      (
        error: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
      ) => {
        res.status(500).json({ error: error.name, message: error.message })
      }
    )

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(res.status).toBe(500)
    expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8')
    expect(await res.json()).toEqual({
      error: 'TypeError',
      message:
        'The "string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received type number (12345)'
    })
  })
})
