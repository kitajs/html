import { mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { RunnersFn } from './runners.js';
import { format, generatePurchases } from './util.js';

const purchases = generatePurchases(1);

async function writeSample(fn) {
  const html = fn('Sample', purchases);

  const formatted = await format(html);

  await writeFile(`./samples/${fn.name}.html`, formatted);
}

// Ensures the samples directory exists
mkdirSync('./samples', { recursive: true });

Promise.all(RunnersFn.map(writeSample)).catch(console.error);
