//@ts-check

/**
 * This file is used to ensure that Kitajs/html and React produces the same output for the
 * same input code in their equivalent components.
 */

import assert from 'node:assert/strict';
import { randomInt, randomUUID } from 'node:crypto';
import { KitaJs, React, ReactJsx } from './runners.js';
import { generatePurchases } from './util.js';

for (const input of [randomUUID(), randomInt(1024 * 3).toString(), 'Arthur ❤️ Kitajs']) {
  // 36000, 4000, 16000 purchases
  const purchases = generatePurchases(input.length * 1000);

  const kitajs = KitaJs(input, purchases);
  const react = React(input, purchases);
  const reactJsx = ReactJsx(input, purchases);

  assert.equal(kitajs, react, 'KitaJs and React produce the same output');
  assert.equal(kitajs, reactJsx, 'KitaJs and ReactJsx produce the same output');
}
