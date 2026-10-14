import express from 'express'
import { describe, expect, test } from 'vitest'
import { expressKitaHtml, kAutoDoctype } from '../src'
import { getServerUrl, startServer } from './server'

describe('autoDoctype', () => {
  test('does not prepend doctype to fragments', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (_, res) => res.html(<div>Not a html root element</div>))

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(await res.text()).toBe('<div>Not a html root element</div>')
  })

  test('prepends doctype to html roots', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (_, res) => res.html(<html lang="en" />))

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(await res.text()).toBe('<!doctype html><html lang="en"></html>')
  })

  test('can disable autoDoctype globally', async () => {
    const app = express()
    app.use(expressKitaHtml({ autoDoctype: false }))

    app.get('/', (_, res) => res.html(<html lang="en" />))

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('<html lang="en"></html>')
  })

  test('can disable autoDoctype per response', async () => {
    const app = express()
    app.use(expressKitaHtml())

    app.get('/', (_, res) => {
      res[kAutoDoctype] = false
      res.html(<html lang="en" />)
    })

    await using server = await startServer(app)
    const res = await fetch(`${getServerUrl(server)}/`)

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('<html lang="en"></html>')
  })
})
