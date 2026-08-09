---
description:
  Benchmark results, methodology, and the architecture choices that make Kita Html faster
  than virtual DOM renderers.
---

# Benchmarks

Kita Html is a string builder. The most representative way to measure its performance is
through micro benchmarks that compare string generation speed against other HTML builders.

## Results

Benchmarked on a 13th Gen Intel Core i5-13600K (~4.80 GHz) running Node.js v24.13.0 on
2026-02-23. Run `pnpm bench` in the repository root to reproduce.

### RealWorldPage (170.5 KiB output)

| Library    | Avg time  | Avg memory | Notes                          |
| ---------- | --------- | ---------- | ------------------------------ |
| KitaJs     | 361.79 µs | 1.83 mb    | baseline                       |
| Preact     | 806.05 µs | 3.09 mb    | 2.2x slower                    |
| ReactJsx   | 1.01 ms   | 3.30 mb    | 2.8x slower                    |
| React      | 1.04 ms   | 3.68 mb    | 2.9x slower                    |
| HonoJsx    | 1.05 ms   | 3.14 mb    | 2.9x slower                    |
| vHtml      | 2.06 ms   | 3.54 mb    | 5.7x slower, different output  |
| TypedHtml  | 2.11 ms   | 7.13 mb    | 5.8x slower, different output  |
| CommonTags | 3.58 ms   | 6.30 mb    | 9.9x slower, template engine   |
| Jsxte      | 3.95 ms   | 13.94 mb   | 10.9x slower, different output |
| Ghtml      | 230.79 µs | 0.65 mb    | template engine, 204.5 KiB     |
| HonoHtml   | 118.12 µs | 0.55 mb    | template engine, 204.5 KiB     |

Libraries marked "different output" produce HTML that differs from React's output for the
same input. Libraries marked "template engine" lack JSX syntax, so they have no per-call
function overhead and produce a larger output for the same logical content.

## Methodology

The RealWorldPage benchmark is the most meaningful, as it represents a realistic workload
scenario with a full component tree. Template engines such as Ghtml and HonoHtml have an
inherent advantage: with no function call per element and no JSX transform, they trade
away syntax highlighting and editor intellisense. The JSX-based results reflect the actual
cost incurred by any JSX library.

## Why it is fast

The performance comes from the string-only architecture. There is no object tree
construction, no diffing, and no serialization step. The runtime uses
character-by-character loops for HTML escaping instead of regex replacements, checks
before converting (regex test before expensive operations), and orders void element checks
by frequency. When running on Bun, the runtime delegates escaping to Bun's native
`escapeHTML` implementation.
