import { createNitro } from 'nitro/builder'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { nitroKitaHtml } from '../src/index.js'

const fixture = path.join(import.meta.dirname, 'fixtures/basic')

describe('nitroKitaHtml', () => {
  test('registers lazy page routes and a renderer', async () => {
    const nitro = await createNitro({
      rootDir: fixture,
      serverDir: './server',
      modules: [nitroKitaHtml()],
      logLevel: 0
    })
    try {
      expect(nitro.options.routes['/']).toMatchObject({ lazy: true, method: 'GET' })
      expect(nitro.options.routes['/users/:id']).toMatchObject({
        lazy: true,
        method: 'GET'
      })
      expect(nitro.options.renderer?.handler).toMatch(/^#kitajs\/nitro-html\/page\//)
      expect(Object.keys(nitro.options.virtual)).toContain(
        nitro.options.renderer!.handler
      )
    } finally {
      await nitro.close()
    }
  })

  test('rejects an existing renderer', async () => {
    await expect(
      createNitro({
        rootDir: fixture,
        serverDir: './server',
        renderer: { handler: './renderer.ts' },
        modules: [nitroKitaHtml()],
        logLevel: 0
      })
    ).rejects.toThrow(/conflicts with the configured Nitro renderer/)
  })

  test('rejects a configured root catch-all route', async () => {
    await expect(
      createNitro({
        rootDir: fixture,
        serverDir: './server',
        routes: { '/**': './renderer.ts' },
        modules: [nitroKitaHtml()],
        logLevel: 0
      })
    ).rejects.toThrow(/GET \/\*\* conflicts with configured route/)
  })
})
