// Records a CPU profile and a sampling heap profile of a single runner.
// Usage: node lib/profile.js [RunnerName]
// Open the generated files in Chrome DevTools (Performance / Memory tabs) or speedscope.

import { mkdir, writeFile } from 'node:fs/promises'
import { Session } from 'node:inspector/promises'
import * as runners from './runners.js'
import { BENCH_NAME, generatePurchases } from './util.js'

const fn = runners[process.argv[2] || 'KitaJs']

if (typeof fn !== 'function') {
  throw new Error(`Unknown runner ${process.argv[2]}`)
}

const purchases = generatePurchases(1000)
let bytes = 0

function render(iterations) {
  for (let i = 0; i < iterations; i++) {
    // Consumes the output like a socket write would, see benchmark.js
    bytes += Buffer.from(fn(BENCH_NAME, purchases)).length
  }
}

// V8 takes thousands of iterations of this page to tier up to optimized code. Profiling
// before that mostly captures the interpreter and baseline compilers.
render(3000)

const session = new Session()
session.connect()

await session.post('Profiler.enable')
await session.post('Profiler.setSamplingInterval', { interval: 100 })
await session.post('Profiler.start')
render(2000)
const { profile } = await session.post('Profiler.stop')

await session.post('HeapProfiler.enable')
await session.post('HeapProfiler.startSampling', { samplingInterval: 4096 })
render(500)
const { profile: heapProfile } = await session.post('HeapProfiler.stopSampling')

session.disconnect()

await mkdir('./profiles', { recursive: true })
await writeFile(`./profiles/${fn.name}.cpuprofile`, JSON.stringify(profile))
await writeFile(`./profiles/${fn.name}.heapprofile`, JSON.stringify(heapProfile))

console.log(
  `Wrote profiles/${fn.name}.cpuprofile and profiles/${fn.name}.heapprofile (${bytes} bytes rendered)`
)
