import { defineKitaHandler, h3KitaHtml } from '@kitajs/h3-html-plugin'
import { AutoSuspense } from '@kitajs/html/suspense'
import { H3 } from 'h3'
import { serve } from 'h3/node'

const app = new H3().register(h3KitaHtml({ autoSuspense: true }))

async function UserCard({ id }: { id: string }) {
  return <div safe>{`user-${id}`}</div>
}

// event.html() for regular handlers.
app.get('/', (event) =>
  event.html(
    <html lang="en">
      <body>
        <h1>Kita + H3</h1>
        <AutoSuspense fallback={<div>Loading user...</div>}>
          <UserCard id="42" />
        </AutoSuspense>
      </body>
    </html>
  )
)

// defineKitaHandler() when an async root creates its first boundary after an await.
app.get(
  '/profile',
  defineKitaHandler(async (event) => {
    const id = await Promise.resolve(event.url.searchParams.get('id') ?? 'guest')

    return (
      <html lang="en">
        <body>
          <AutoSuspense fallback={<div>Loading profile...</div>}>
            <UserCard id={id} />
          </AutoSuspense>
        </body>
      </html>
    )
  })
)

serve(app, { port: 3000 })
