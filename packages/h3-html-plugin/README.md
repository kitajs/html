# H3 Kita Html Plugin

`@kitajs/h3-html-plugin` integrates Kita JSX with H3 v2. It provides `event.html()` for
buffered and Suspense-aware responses, plus `defineKitaHandler()` for factory-safe
automatic Suspense.

```bash
pnpm add @kitajs/html @kitajs/h3-html-plugin h3
```

```tsx
import { H3 } from 'h3'
import { h3KitaHtml } from '@kitajs/h3-html-plugin'

const app = new H3().register(h3KitaHtml({ autoSuspense: true }))
app.get('/', (event) =>
  event.html(
    <html>
      <body>Hello</body>
    </html>
  )
)
```

See the [H3 integration guide](https://html.kitajs.org/integrations/frameworks/h3) for
setup, Suspense, and response behavior.

Current Suspense support requires a Node-compatible runtime because `@kitajs/html` uses
Node streams and `AsyncLocalStorage`.
