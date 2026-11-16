//@ts-check

/**
 * Ensures every runner produces the same html as React for the same input, so the
 * benchmark compares the same amount of work. Run with `pnpm test`.
 */

import assert from 'node:assert/strict'
import { randomInt, randomUUID } from 'node:crypto'
import { React, RunnersFn } from './runners.js'
import { BENCH_NAME, generatePurchases, normalizeEntities } from './util.js'

for (const input of [
  randomUUID(),
  randomInt(1024 * 3).toString(),
  'Arthur ❤️ Kitajs',
  BENCH_NAME
]) {
  const purchases = generatePurchases(input.length * 1000)
  const react = normalizeEntities(React(input, purchases))

  for (const fn of RunnersFn) {
    assert.equal(
      normalizeEntities(fn(input, purchases)),
      react,
      `${fn.name} and React produce the same output`
    )
  }
}

console.log('All runners produce the same output as React')
