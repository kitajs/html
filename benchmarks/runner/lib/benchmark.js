import './react-equality.js';
import './samples.js';

import { bench, boxplot, run } from 'mitata';
import { React, RunnerType, RunnersFn } from './runners.js';
import { generatePurchases, humanFileSize } from './util.js';

const purchases = generatePurchases(1000);
const reactOutput = React('1', purchases);

boxplot(() => {
  for (const fn of RunnersFn) {
    let name = fn.name;

    if (fn.type === RunnerType.template) {
      name = `* ${name}`;
    }

    const sampleOutput = fn('1', purchases);

    if (fn.type === RunnerType.jsx && sampleOutput !== reactOutput) {
      name = `! ${name}`;
    }

    name = `${name} ${humanFileSize(sampleOutput.length)}`;

    bench(name, () => fn('Benchmark', purchases)).baseline(fn.baseline);
  }
});

const footer = `
Sizes are the final html output based on the same input.

!) Are jsx runtimes that produces different output from React for the same input ⚠️

*) Are template engines, which usually lacks syntax highlighting and intellisense:
   https://github.com/kitajs/html/blob/master/benchmarks/templates/normal.tsx

`.trimEnd();

run().then(
  () => console.log(footer),
  (err) => console.error(err)
);
