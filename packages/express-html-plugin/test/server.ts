import type { Express } from 'express'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'

export async function startServer(app: Express): Promise<Server> {
  const server = createServer(app)

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })

  return server
}

export function getServerUrl(server: Server): string {
  const address = server.address() as AddressInfo | null

  if (!address) {
    throw new Error('Server is not listening')
  }

  return `http://127.0.0.1:${address.port}`
}
