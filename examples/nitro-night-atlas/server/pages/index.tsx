import { Layout } from '../components/Layout.js'

const objects = [
  ['M42', 'Orion', 'stellar nursery'],
  ['M31', 'Andromeda', 'spiral galaxy'],
  ['M45', 'Pleiades', 'open cluster']
] as const

export default function Home() {
  return (
    <Layout title="Night Atlas">
      <main>
        <p class="kicker">A field guide for unaided nights</p>
        <h1>Find something ancient before dawn.</h1>
        <p class="intro">
          Three bright deep-sky objects, chosen for observers with a small scope and one
          clear evening.
        </p>
        <section class="cards" aria-label="Featured objects">
          {objects.map(([catalogue, name, kind]) => (
            <a class="card" href={`/objects/${name.toLowerCase()}`}>
              <span>{catalogue}</span>
              <h2>{name}</h2>
              <p>{kind}</p>
            </a>
          ))}
        </section>
      </main>
    </Layout>
  )
}
