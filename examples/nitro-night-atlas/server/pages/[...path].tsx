import { escapeHtml } from '@kitajs/html'
import type { H3Event } from 'nitro'
import { Layout } from '../components/Layout.js'

export default function Uncharted(event: H3Event) {
  return (
    <Layout title="Uncharted · Night Atlas">
      <main>
        <p class="kicker">Uncharted coordinates</p>
        <h1>{escapeHtml(event.url.pathname)} is not on this map.</h1>
        <p class="intro">
          The catch-all page is Nitro's renderer, after every specific route.
        </p>
        <a class="action" href="/">
          Open the atlas
        </a>
      </main>
    </Layout>
  )
}
