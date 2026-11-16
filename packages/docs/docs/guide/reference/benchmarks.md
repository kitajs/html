---
description:
  Benchmark results, methodology, and the architecture choices that make Kita Html faster
  than virtual DOM renderers.
---

# Benchmarks

Kita Html is a string builder. Its performance is measured by rendering the same component
tree with each library and comparing time and memory.

## Results

Benchmarked on a 13th Gen Intel Core i5-13600K (~4.80 GHz) running Node.js v24.16.0 on
2026-11-15, pinned to the performance cores. Run `pnpm bench` in the repository root to
reproduce.

### RealWorldPage

| Library  | Avg time  | Avg memory | Output    | Notes       |
| -------- | --------- | ---------- | --------- | ----------- |
| KitaJs   | 733.83 µs | 1.88 MB    | 201.0 KiB | baseline    |
| Preact   | 1.12 ms   | 3.61 MB    | 195.1 KiB | 1.5x slower |
| ReactJsx | 1.38 ms   | 4.14 MB    | 207.9 KiB | 1.9x slower |
| React    | 1.55 ms   | 4.46 MB    | 207.9 KiB | 2.1x slower |
| HonoJsx  | 1.68 ms   | 3.81 MB    | 206.0 KiB | 2.3x slower |

Output sizes differ because each library picks different, equally valid, entities when
escaping. Preact leaves `'` and `>` unescaped in text, React escapes both.

## Methodology

The RealWorldPage benchmark renders a full component tree with 1000 list items. Every
library must produce the same HTML as React's `renderToStaticMarkup` for the same input,
which includes characters that need escaping. The output is converted to a `Buffer`, as
writing it to a socket would, because V8 defers part of the string building cost until a
concatenated string is read.

Only JSX runtimes are compared. Every one of them pays one function call per element and
renders the same source code, so the rows compare like with like.

`pnpm stress` renders each feature in isolation (attributes, class arrays, style objects,
escaping, fragments, async components and Suspense streaming) and can record a cpu and
heap profile of each one.

## Implementation details

The performance comes from building strings directly. String concatenation is the main
cost, so the runtime caches the pieces derived from tag, attribute and style property
names, reads each props object in a single pass, and joins nested children without copying
arrays. Escaping uses character loops instead of regex replacements. When running on Bun,
the runtime delegates escaping to Bun's native `escapeHTML` implementation.
