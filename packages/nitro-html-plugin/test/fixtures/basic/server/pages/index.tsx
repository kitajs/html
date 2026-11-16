import type { H3Event } from 'nitro'

export default function Home(event: H3Event) {
  event.res.headers.set('x-page', 'index')

  return (
    <html>
      <body>Home</body>
    </html>
  )
}
