import { mkdir, writeFile } from 'node:fs/promises'
import { RunnersFn } from './runners.js'
import { BENCH_NAME, format, generatePurchases } from './util.js'

/** Writes a formatted sample of each runner output to the samples directory. */
export async function writeSamples() {
  const purchases = generatePurchases(1)

  await mkdir('./samples', { recursive: true })

  await Promise.all(
    RunnersFn.map(async (fn) => {
      const html = await format(fn(BENCH_NAME, purchases))
      await writeFile(`./samples/${fn.name}.html`, html)
    })
  )
}
