import fastifyKitaHtml from '@kitajs/fastify-html-plugin'
import { Suspense } from '@kitajs/html/suspense'
import fastify from 'fastify'

const app = fastify()
await app.register(fastifyKitaHtml)

async function UserCard({ id }: { id: string }) {
  return <div safe>{`user-${id}`}</div>
}

app.get('/', (req, reply) => {
  reply.html(
    <html lang="en">
      <body>
        <h1>Kita + Fastify</h1>
        <Suspense rid={req.id} fallback={<div>Loading user...</div>}>
          <UserCard id="42" />
        </Suspense>
      </body>
    </html>
  )
})
