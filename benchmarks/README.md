<h1>Benchmark</h1>

- [Results](#results)
- [Running](#running)
- [Methodology](#methodology)
- [Stress scenarios](#stress-scenarios)
- [Versions](#versions)

## Results

See [results.txt](./results.txt) for the latest `pnpm bench` output.

## Running

```sh
pnpm bench    # RealWorldPage against other libraries
pnpm stress   # Each Kita Html feature in isolation

# cpu + heap profile of the RealWorldPage, defaults to KitaJs
pnpm -F @kitajs/bench-html-runner profile [Runner]

# cpu + heap profile of the stress scenarios matching the filters
pnpm -F @kitajs/bench-html-stress stress --cpu-prof --heap-prof [...filters]
```

Profiles are written to a `profiles/` directory inside the package and open in Chrome
DevTools or [speedscope](https://www.speedscope.app/).

Close other heavy programs before running. On CPUs with performance and efficiency cores
(Intel 12th gen and later, Apple Silicon), the OS may move the process between core types
in the middle of a run, and the same code measures up to 2x slower on an efficiency core.
Pin the process to performance cores for numbers you want to compare:

```sh
# Linux, check `lscpu --all --extended` for which CPUs are performance cores
taskset -c 0-11 pnpm bench

# Windows (cmd), the mask selects logical processors 0-11
start /affinity 0xFFF /wait /b pnpm bench
```

Compare ratios between libraries within one run instead of absolute times across machines
or runs.

## Methodology

All runners render the same `RealWorldPage` with 1000 purchases and must produce the same
html as `ReactDOMServer.renderToStaticMarkup`. `pnpm test` asserts this, after mapping
equivalent entity encodings (`&#39;` and `&#x27;`) to one form.

Names in the input contain `&`, `<`, `>`, `"` and `'`, so every runner exercises its
escaping path.

The rendered html is passed to `Buffer.from`, which is what writing it to a socket does.
V8 builds concatenated strings as ropes (trees of string pieces) and only flattens them
into a single string when they are read. Without reading the output, a library that builds
deep ropes skips work that every real response pays for, which made rope based libraries
look up to 2.6x faster than they are.

Only JSX runtimes are compared, since they all pay one function call per element and
accept the same source code. Tagged template engines skip that cost by concatenating whole
templates, at the price of type checking and `kita-html check`, so they measure a
different trade-off.

Prettier formats the [samples](./runner/samples) before the benchmark starts, so it does
not compete with the first runners for the CPU.

## Stress scenarios

The RealWorldPage only covers string attributes, plain children and components.
[`stress`](./stress/src/scenarios.tsx) renders one scenario per Kita Html feature
(attributes, class arrays, style objects, escaping, fragments, lists next to siblings,
dynamic tags, async components and Suspense streaming) in a loop and reports the median
time per render.

It has nothing to compare against. Use it to profile a single feature, or to compare a
change by running it before and after on the same idle machine. `--time <ms>` sets how
long each scenario runs, the default is 2000.

## Versions

```json
{
  "hono": "4.12.18",
  "mitata": "1.0.34",
  "preact": "10.28.2",
  "preact-render-to-string": "6.6.6",
  "react-dom": "19.2.8"
}
```
