import { html } from '@elysiajs/html'
import { Elysia } from 'elysia'

new Elysia()
  .use(html())
  .get('/', () => (
    <html lang="en">
      <body>
        <h1>Kita + Elysia</h1>
        <p>Rendered as HTML strings.</p>
      </body>
    </html>
  ))
  .listen(3000)
