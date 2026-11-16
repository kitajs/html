import { bench, boxplot, do_not_optimize, run } from 'mitata'
import { RunnersFn } from './runners.js'
import { writeSamples } from './samples.js'
import { BENCH_NAME, generatePurchases, humanFileSize } from './util.js'

// Samples are formatted with prettier, which is async and CPU heavy. It must finish before
// mitata starts, otherwise it competes with the first benchmarks for the CPU.
await writeSamples()

const purchases = generatePurchases(1000)

boxplot(() => {
  for (const fn of RunnersFn) {
    // Output equality with React is asserted by `pnpm test` (lib/react-equality.js)
    const name = `${fn.name} ${humanFileSize(fn(BENCH_NAME, purchases).length)}`

    // String concatenation in V8 creates ropes (trees of string pieces) that are only
    // flattened when the string is read. Returning the string without reading it leaves
    // that work out of the measurement, which favors runtimes that build deep ropes.
    // Buffer.from does what writing the html to a socket does: flattens and encodes it.
    bench(name, () => do_not_optimize(Buffer.from(fn(BENCH_NAME, purchases)))).baseline(
      fn.baseline
    )
  }
})

await run()

console.log('\nSizes are the final html output based on the same input.')
