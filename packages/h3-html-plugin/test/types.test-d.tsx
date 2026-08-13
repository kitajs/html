import { expectTypeOf, test } from 'vitest'
import { defineKitaHandler, h3KitaHtml } from '../src/index.js'

test('types H3 integration', () => {
  expectTypeOf(h3KitaHtml({ autoDoctype: false, autoSuspense: true })).toBeFunction()

  const handler = defineKitaHandler((event) => (
    <div safe>{event.context.kitaHtml!.requestId}</div>
  ))

  expectTypeOf(handler.fetch).toBeFunction()
})
