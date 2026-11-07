import { defineKitaHandler, h3KitaHtml } from '@kitajs/h3-html-plugin'
import { AutoSuspense } from '@kitajs/html/suspense'
import { H3 } from 'h3'
import { serve } from 'h3/node'
import { readFileSync } from 'node:fs'
import { setTimeout } from 'node:timers/promises'

const app = new H3().register(h3KitaHtml())
const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

type ReadingProps = {
  delay: number
  label: string
  unit: string
  value: string
}

async function Reading({ delay, label, unit, value }: ReadingProps) {
  await setTimeout(delay)
  return (
    <article class="reading ready">
      <span class="status">received</span>
      <strong safe>{value}</strong>
      <small safe>{unit}</small>
      <p safe>{label}</p>
    </article>
  )
}

function PendingReading({ label }: Pick<ReadingProps, 'label'>) {
  return (
    <article class="reading pending">
      <span class="status">listening</span>
      <strong>···</strong>
      <small>signal</small>
      <p safe>{label}</p>
    </article>
  )
}

const signalRoom = defineKitaHandler((event) => {
  const station = event.url.searchParams.get('station') || 'north-7'

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Signal Room</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <main>
          <header>
            <p class="eyebrow">remote environmental array</p>
            <h1>
              Signal room <span safe>{station}</span>
            </h1>
            <p class="lede">
              The frame is already here. Each instrument reports when its own reading is
              ready.
            </p>
          </header>

          <section class="grid" aria-label="Live station readings">
            <AutoSuspense fallback={<PendingReading label="Upper-air temperature" />}>
              <Reading
                delay={450}
                label="Upper-air temperature"
                value="−41.8"
                unit="°C"
              />
            </AutoSuspense>
            <AutoSuspense fallback={<PendingReading label="Solar wind velocity" />}>
              <Reading delay={900} label="Solar wind velocity" value="428" unit="km/s" />
            </AutoSuspense>
            <AutoSuspense fallback={<PendingReading label="Magnetic inclination" />}>
              <Reading
                delay={1350}
                label="Magnetic inclination"
                value="67.2"
                unit="deg"
              />
            </AutoSuspense>
          </section>

          <footer>
            <span>H3 request</span>
            <code safe>{event.context.kitaHtml?.requestId}</code>
            <a href="/?station=aurora">Retune to aurora</a>
          </footer>
        </main>
      </body>
    </html>
  )
})

app.get('/', signalRoom)
app.get('/health', (event) => event.html(<strong>signal room online</strong>))
app.get(
  '/styles.css',
  () => new Response(styles, { headers: { 'content-type': 'text/css; charset=utf-8' } })
)

serve(app, { port: 3000 })
console.log('Signal Room listening on http://localhost:3000')
