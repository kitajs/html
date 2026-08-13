import type { H3Event } from 'nitro'
import { expectTypeOf, test } from 'vitest'
import { nitroKitaHtml, type NitroHtmlPage } from '../src/index.js'

test('types Nitro pages and options', () => {
  const page: NitroHtmlPage = (event: H3Event) => <div>{event.url.pathname}</div>
  expectTypeOf(page).toBeFunction()
  expectTypeOf(nitroKitaHtml({ pagesDir: './server/pages' }).setup).toBeFunction()
})
