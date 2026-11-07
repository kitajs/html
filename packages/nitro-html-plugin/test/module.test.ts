import { createNitro } from 'nitro/builder'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { nitroKitaHtml } from '../src/index.js'

const fixture = path.join(import.meta.dirname, 'fixtures/basic')

/** Creates a throwaway Nitro project from a map of relative paths to file contents. */
async function createProject(files: Record<string, string>) {
  const dir = await mkdtemp(path.join(tmpdir(), 'kita-nitro-'))

  for (const [file, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(dir, file)), { recursive: true })
    await writeFile(path.join(dir, file), content)
  }

  return dir
}

describe('nitroKitaHtml', () => {
  test('registers lazy GET and HEAD page handlers and a renderer', async () => {
    const nitro = await createNitro({
      rootDir: fixture,
      serverDir: './server',
      modules: [nitroKitaHtml()],
      logLevel: 0
    })

    try {
      for (const route of ['/', '/users/:id', '/stream']) {
        const handlers = nitro.options.handlers.filter(
          (handler) => handler.route === route
        )

        for (const handler of handlers) {
          expect(handler).toMatchObject({ lazy: true })
          expect(handler.handler).toMatch(/^#kitajs\/nitro-html\/page\//)
        }

        expect(handlers.map((handler) => handler.method).sort()).toEqual(['GET', 'HEAD'])
      }

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

  test('rejects a scanned route that collides with a page', async () => {
    const dir = await createProject({
      'server/pages/users/[id].tsx': 'export default () => "user"',
      'server/routes/users/[slug].ts': 'export default () => "route"'
    })

    try {
      const nitro = await createNitro({
        rootDir: dir,
        serverDir: './server',
        modules: [nitroKitaHtml()],
        logLevel: 0
      })

      try {
        await expect(nitro.hooks.callHook('build:before', nitro)).rejects.toThrow(
          /GET \/users\/:id conflicts with scanned Nitro route/
        )
      } finally {
        await nitro.close()
      }
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  test('rejects a grouped catch-all next to the root renderer', async () => {
    const dir = await createProject({
      'server/pages/[...].tsx': 'export default () => "root"',
      'server/pages/(site)/[...].tsx': 'export default () => "grouped"'
    })

    try {
      await expect(
        createNitro({
          rootDir: dir,
          serverDir: './server',
          modules: [nitroKitaHtml()],
          logLevel: 0
        })
      ).rejects.toThrow(/multiple renderer pages found/)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
