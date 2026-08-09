import { AutoSuspense, Suspense } from '@kitajs/html/suspense'
import express from 'express'
import { expectTypeOf, test } from 'vitest'
import { expressKitaHtml, kAutoDoctype } from '../src'

test('express-html-plugin types', () => {
  expectTypeOf(expressKitaHtml).toBeFunction()
  expectTypeOf(kAutoDoctype).toEqualTypeOf<typeof kAutoDoctype>()

  const app = express()
  app.use(expressKitaHtml())
  app.use(expressKitaHtml({ autoDoctype: true }))
  app.use(expressKitaHtml({ disableRequestId: true }))
  app.use(expressKitaHtml({ autoSuspense: true }))

  app.get('/', (request, response) => {
    expectTypeOf(request.id).toEqualTypeOf<string | number>()
    expectTypeOf(response.html).toBeFunction()

    response.html('<div>hello world</div>')
    response[kAutoDoctype] = false
  })

  app.get('/jsx', (_, response) => {
    response.html(<div>hello world</div>)
  })

  app.get('/stream', (request, response) => {
    response.html(
      <Suspense rid={request.id} fallback={<div>fallback</div>}>
        {Promise.resolve(1)}
      </Suspense>
    )
  })

  app.get('/auto-suspense', (_, response) => {
    response.html(
      <AutoSuspense fallback={<div>fallback</div>}>{Promise.resolve(1)}</AutoSuspense>
    )
  })

  // @ts-expect-error - should not accept number
  app.get('/invalid', (_, response) => response.html(12345))

  // @ts-expect-error - invalid option
  app.use(expressKitaHtml({ invalidOption: true }))
})
