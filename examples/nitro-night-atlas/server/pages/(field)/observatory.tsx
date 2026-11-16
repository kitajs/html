import { Layout } from '../../components/Layout.js'

export default function Observatory() {
  return (
    <Layout title="Observatory · Night Atlas">
      <main>
        <p class="kicker">Route groups without URL noise</p>
        <h1>A dark hill, a red lamp, no notifications.</h1>
        <p class="intro">
          This page lives inside <code>(field)</code>, but Nitro exposes it cleanly at
          <code>/observatory</code>.
        </p>
      </main>
    </Layout>
  )
}
