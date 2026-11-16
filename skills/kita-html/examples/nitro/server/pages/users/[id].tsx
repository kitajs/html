import { AutoSuspense } from '@kitajs/html/suspense'
import type { H3Event } from 'nitro'

async function UserCard({ id }: { id: string }) {
  return <div safe>{`user-${id}`}</div>
}

// Pages default-export (event) => JSX.Element. AutoSuspense works without extra options.
export default function UserPage(event: H3Event) {
  const id = event.context.params?.id ?? ''

  return (
    <html lang="en">
      <body>
        <h1>Kita + Nitro</h1>
        <AutoSuspense fallback={<div>Loading user...</div>}>
          <UserCard id={id} />
        </AutoSuspense>
      </body>
    </html>
  )
}
