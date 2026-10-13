import { escapeHtml } from '@kitajs/html'
import type { H3Event } from 'nitro'
import { Layout } from '../../components/Layout.js'

const catalogue = {
  andromeda: ['M31', '2.5M ly', 'Autumn', 'A faint oval beyond Cassiopeia.'],
  orion: ['M42', '1,344 ly', 'Winter', 'A luminous nursery hanging below the belt.'],
  pleiades: ['M45', '444 ly', 'Winter', 'A blue-white cluster visible without optics.']
} as const

export default function ObjectPage(event: H3Event) {
  const slug = event.context.params?.slug || ''
  const object = catalogue[slug as keyof typeof catalogue]

  if (!object) {
    event.res.status = 404
    return (
      <Layout title="Object not catalogued">
        <main>
          <p class="kicker">No catalogue match</p>
          <h1>{escapeHtml(slug)} is beyond this pocket atlas.</h1>
          <a class="action" href="/">
            Return to the chart
          </a>
        </main>
      </Layout>
    )
  }

  const [catalogueNumber, distance, season, note] = object
  return (
    <Layout title={`${catalogueNumber} · Night Atlas`}>
      <main>
        <p class="kicker">{catalogueNumber} / field note</p>
        <h1 safe>{slug}</h1>
        <p class="intro">{note}</p>
        <section class="facts">
          <div class="fact">
            <strong>{distance}</strong>
            <small>distance</small>
          </div>
          <div class="fact">
            <strong>{season}</strong>
            <small>best season</small>
          </div>
          <div class="fact">
            <strong>20×</strong>
            <small>suggested magnification</small>
          </div>
        </section>
      </main>
    </Layout>
  )
}
