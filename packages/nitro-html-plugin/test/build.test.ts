import { build, copyPublicAssets, createNitro, prepare } from 'nitro/builder'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer, type RequestListener, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { nitroKitaHtml } from '../src/index.js'

const fixture = path.join(import.meta.dirname, 'fixtures/basic')

let outputDir: string
let server: Server
let baseUrl: string

beforeAll(async () => {
  outputDir = await mkdtemp(path.join(tmpdir(), 'kita-nitro-build-'))

  const nitro = await createNitro({
    rootDir: fixture,
    serverDir: './server',
    preset: 'node-middleware',
    output: { dir: outputDir },
    modules: [nitroKitaHtml()],
    logLevel: 0
  })

  try {
    await prepare(nitro)
    await copyPublicAssets(nitro)
    await build(nitro)
  } finally {
    await nitro.close()
  }

  const entry = pathToFileURL(path.join(outputDir, 'server/index.mjs')).href
  const { middleware } = (await import(entry)) as { middleware: RequestListener }

  server = createServer(middleware)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
}, 60_000)

afterAll(async () => {
  await new Promise((resolve) => server?.close(resolve))
  await rm(outputDir, { recursive: true, force: true })
})

describe('built Nitro app', () => {
  test('renders a page for GET', async () => {
    const response = await fetch(`${baseUrl}/`)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(response.headers.get('x-page')).toBe('index')
    expect(await response.text()).toBe('<!doctype html><html><body>Home</body></html>')
  })

  test('routes HEAD to the page instead of the renderer', async () => {
    const response = await fetch(`${baseUrl}/`, { method: 'HEAD' })

    expect(response.status).toBe(200)
    expect(response.headers.get('x-page')).toBe('index')
  })

  test('passes dynamic route parameters', async () => {
    const response = await fetch(`${baseUrl}/users/42`)

    expect(await response.text()).toBe('<div>42</div>')
  })

  test('streams a boundary created after the async page yields', async () => {
    const html = await (await fetch(`${baseUrl}/stream`)).text()

    expect(html.indexOf('data-sf')).toBeLessThan(html.indexOf('data-sr'))
    expect(html).toContain('loaded')
  })

  test('keeps API routes ahead of pages and the renderer', async () => {
    const response = await fetch(`${baseUrl}/api/health`)

    expect(await response.json()).toEqual({ ok: true })
  })

  test('renders unmatched GET and HEAD requests with the renderer', async () => {
    const get = await fetch(`${baseUrl}/missing/page`)
    const head = await fetch(`${baseUrl}/missing/page`, { method: 'HEAD' })

    expect(get.status).toBe(200)
    expect(await get.text()).toBe('<div>Fallback</div>')
    expect(head.status).toBe(200)
    expect(head.headers.get('x-page')).toBe('renderer')
  })

  test('rejects other methods on the renderer', async () => {
    const response = await fetch(`${baseUrl}/missing/page`, { method: 'POST' })

    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('GET, HEAD')
  })
})
