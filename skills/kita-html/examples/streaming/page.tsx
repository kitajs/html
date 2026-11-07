import { ErrorBoundary } from '@kitajs/html/error-boundary'
import { Suspense, renderToStream } from '@kitajs/html/suspense'

async function ActivityFeed() {
  return <div>Feed loaded</div>
}

export const stream = renderToStream((rid) => (
  <html lang="en">
    <body>
      <ErrorBoundary catch={<div>Fallback failed</div>}>
        <Suspense
          rid={rid}
          fallback={<div>Loading feed...</div>}
          catch={(error) => <div safe>{String(error)}</div>}
        >
          <ActivityFeed />
        </Suspense>
      </ErrorBoundary>
    </body>
  </html>
))
