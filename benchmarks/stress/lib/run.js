// Renders each scenario in a loop and reports its time per render. Optionally records a
// cpu profile and a sampling heap profile per scenario.
//
// Usage: node lib/run.js [...filters] [--cpu-prof] [--heap-prof] [--time <ms>]
//
// Profiles are written to ./profiles and open in Chrome DevTools or speedscope.
// Compare numbers only between runs on the same idle machine, see benchmarks/README.md.

const { mkdirSync, writeFileSync } = require('node:fs')
const { Session } = require('node:inspector/promises')
const { parseArgs } = require('node:util')
const { scenarios } = require('../dist/stress/src/scenarios.js')

const { values: options, positionals: filters } = parseArgs({
  allowPositionals: true,
  options: {
    'cpu-prof': { type: 'boolean', default: false },
    'heap-prof': { type: 'boolean', default: false },
    // Milliseconds spent measuring (and profiling) each scenario
    time: { type: 'string', default: '2000' }
  }
})

const TIME = BigInt(options.time) * 1_000_000n
// V8 needs thousands of renders to tier up to optimized code. Measuring or profiling
// before that mostly captures the interpreter and baseline compilers.
const WARMUP = 1_000_000_000n
const BATCH = 2_000_000n

// Reads the output like a socket write would. V8 only flattens concatenated strings when
// they are read, so skipping this leaves part of the rendering cost out.
const consume = (html) => Buffer.from(html).length

/**
 * Renders the scenario for `duration` nanoseconds, returns the time per render of each
 * batch
 */
async function loop(render, duration) {
  const batches = []
  const end = process.hrtime.bigint() + duration

  while (process.hrtime.bigint() < end) {
    const start = process.hrtime.bigint()
    let renders = 0

    do {
      const html = render()
      consume(typeof html === 'string' ? html : await html)
      renders++
    } while (process.hrtime.bigint() - start < BATCH)

    batches.push(Number(process.hrtime.bigint() - start) / renders / 1000)
  }

  return batches
}

function format(us) {
  return us >= 1000 ? `${(us / 1000).toFixed(2)} ms` : `${us.toFixed(1)} µs`
}

async function main() {
  const session = new Session()
  session.connect()

  if (options['cpu-prof'] || options['heap-prof']) {
    mkdirSync('./profiles', { recursive: true })
  }

  console.log(
    'scenario'.padEnd(24) +
      'size'.padStart(10) +
      'median'.padStart(12) +
      'p99'.padStart(12)
  )

  for (const [name, render] of Object.entries(scenarios)) {
    if (filters.length && !filters.some((filter) => name.includes(filter))) {
      continue
    }

    const html = await render()

    await loop(render, WARMUP)

    if (options['cpu-prof']) {
      await session.post('Profiler.enable')
      await session.post('Profiler.setSamplingInterval', { interval: 100 })
      await session.post('Profiler.start')
    }

    const batches = (await loop(render, TIME)).sort((a, b) => a - b)

    if (options['cpu-prof']) {
      const { profile } = await session.post('Profiler.stop')
      writeFileSync(`./profiles/${name}.cpuprofile`, JSON.stringify(profile))
    }

    // Separate run so heap sampling does not show up in the cpu profile
    if (options['heap-prof']) {
      await session.post('HeapProfiler.enable')
      await session.post('HeapProfiler.startSampling', { samplingInterval: 4096 })
      await loop(render, TIME)
      const { profile } = await session.post('HeapProfiler.stopSampling')
      writeFileSync(`./profiles/${name}.heapprofile`, JSON.stringify(profile))
    }

    console.log(
      name.padEnd(24) +
        `${(html.length / 1024).toFixed(1)} KiB`.padStart(10) +
        format(batches[batches.length >> 1]).padStart(12) +
        format(batches[Math.floor(batches.length * 0.99)]).padStart(12)
    )
  }

  session.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
