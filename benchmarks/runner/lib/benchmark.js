import './react-equality.js';
import './samples.js';

import { bench, boxplot, run } from 'mitata';
import { RunnerType, RunnersFn } from './runners.js';
import { generatePurchases } from './util.js';

const purchases = generatePurchases(1000);

boxplot(() => {
  for (const fn of RunnersFn) {
    let name = fn.name;

    if (fn.type === RunnerType.template) {
      name = `(T) ${name}`;
    }

    bench(name, () => fn('Benchmark', purchases)).baseline(fn.baseline);
  }
});

run().catch(console.error);
