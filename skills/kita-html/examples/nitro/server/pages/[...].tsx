import { escapeHtml } from '@kitajs/html'
import type { H3Event } from 'nitro'

// The root catch-all becomes Nitro's renderer for unmatched GET/HEAD requests.
export default function NotFound(event: H3Event) {
  event.res.status = 404

  return (
    <html lang="en">
      <body>
        <h1>{escapeHtml(event.url.pathname)} was not found</h1>
      </body>
    </html>
  )
}
