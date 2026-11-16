import { expressKitaHtml } from '@kitajs/express-html-plugin'
import { Suspense } from '@kitajs/html/suspense'
import express from 'express'

const app = express()
app.use(expressKitaHtml())

async function Dashboard() {
  return <div>Ready</div>
}

app.get('/', (req, res) => {
  res.html(
    <html lang="en">
      <body>
        <h1>Kita + Express</h1>
        <Suspense rid={req.id} fallback={<div>Loading dashboard...</div>}>
          <Dashboard />
        </Suspense>
      </body>
    </html>
  )
})
