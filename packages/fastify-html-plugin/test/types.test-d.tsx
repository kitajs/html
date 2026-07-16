import { AutoSuspense, Suspense } from '@kitajs/html/suspense'
import fastify from 'fastify'
import { expectTypeOf, test } from 'vitest'
import { fastifyKitaHtml, kAutoDoctype } from '../src'

test('fastify-html-plugin types', () => {
  expectTypeOf(fastifyKitaHtml).toBeFunction()
  expectTypeOf(kAutoDoctype).toEqualTypeOf<typeof kAutoDoctype>()

  const app = fastify()

  app.register(fastifyKitaHtml)

  app.register(fastifyKitaHtml, {
    autoDoctype: true,
    autoSuspense: true
  })

  app.get('/', async (_, reply) => {
    expectTypeOf(reply.html).toBeFunction()
    reply.html('<div>hello world</div>')
  })

  app.get('/jsx', async (_, reply) => {
    reply.html(<div>hello world</div>)
  })

  app.get('/stream', async (_, reply) => {
    reply.html('<div>hello world</div>')
  })

  app.get('/stream/jsx', async (_, reply) => {
    reply.html(<div>hello world</div>)
  })

  app.get('/stream/suspense', async (request, reply) => {
    reply.html(
      <Suspense rid={request.id} fallback={<div>fallback</div>}>
        {Promise.resolve(1)}
      </Suspense>
    )
  })

  app.get('/stream/auto-suspense', async (_, reply) => {
    reply.html(
      <AutoSuspense fallback={<div>fallback</div>}>{Promise.resolve(1)}</AutoSuspense>
    )
  })

  const invalidAutoProps: Parameters<typeof AutoSuspense>[0] = {
    // @ts-expect-error - AutoSuspense obtains the request id from its scope
    rid: 'req-1',
    fallback: 'fallback',
    children: 'content'
  }
  void invalidAutoProps

  // @ts-expect-error - should not accept number
  app.get('/invalid', async (_, reply) => reply.html(12345))

  // @ts-expect-error - invalid option
  app.register(fastifyKitaHtml, { invalidOption: true })
})
