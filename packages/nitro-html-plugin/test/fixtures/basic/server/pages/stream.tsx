import { AutoSuspense } from '@kitajs/html/suspense'
import { setTimeout } from 'node:timers/promises'

export default async function Stream() {
  // The first boundary is created only after the root yields.
  await setTimeout(1)

  return (
    <div>
      <AutoSuspense fallback="loading">{setTimeout(5, 'loaded')}</AutoSuspense>
    </div>
  )
}
