import type { H3Event } from 'nitro'

export default function User(event: H3Event) {
  return <div safe>{event.context.params?.id}</div>
}
