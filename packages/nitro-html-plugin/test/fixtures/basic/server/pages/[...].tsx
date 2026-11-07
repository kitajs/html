import type { H3Event } from 'nitro'

export default function Fallback(event: H3Event) {
  event.res.headers.set('x-page', 'renderer')

  return <div>Fallback</div>
}
