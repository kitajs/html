# Benchmarks

Kita Html is a string builder. The most representative way to measure its performance is
through micro benchmarks that compare string generation speed against other HTML builders.

## Results

Benchmarked on an Apple M4 Pro (12 cores, 24 GB) running Node.js v24.12.0 on 2026-02-21.
Run `pnpm bench` in the repository root to reproduce.

### RealWorldPage (170.5 KiB output)

| Library    | Avg time  | Notes                         |
| ---------- | --------- | ----------------------------- |
| KitaJs     | 270.46 µs | baseline                      |
| Preact     | 467.59 µs | 1.7x slower                   |
| ReactJsx   | 662.31 µs | 2.4x slower                   |
| React      | 747.92 µs | 2.8x slower                   |
| HonoJsx    | 782.56 µs | 2.9x slower                   |
| TypedHtml  | 1.26 ms   | 4.7x slower, different output |
| vHtml      | 1.58 ms   | 5.8x slower, different output |
| Jsxte      | 2.41 ms   | 8.9x slower, different output |
| CommonTags | 2.68 ms   | 9.9x slower, template engine  |
| Ghtml      | 147.37 µs | template engine, 204.5 KiB    |
| HonoHtml   | 108.91 µs | template engine, 204.5 KiB    |

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
