---
description:
  Benchmark results, methodology, and the architecture choices that make Kita Html faster
  than virtual DOM renderers.
---

# Benchmarks

Kita Html is a string builder. Its performance is measured by rendering the same component
tree with each library and comparing time and memory.

## Results

Benchmarked on a 13th Gen Intel Core i5-13600K (~4.80 GHz) running Node.js v24.13.0 on
2026-02-23. Run `pnpm bench` in the repository root to reproduce.

### RealWorldPage (170.5 KiB output)

| Library    | Avg time  | Avg memory | Notes                          |
| ---------- | --------- | ---------- | ------------------------------ |
| KitaJs     | 361.79 µs | 1.83 MB    | baseline                       |
| Preact     | 806.05 µs | 3.09 MB    | 2.2x slower                    |
| ReactJsx   | 1.01 ms   | 3.30 MB    | 2.8x slower                    |
| React      | 1.04 ms   | 3.68 MB    | 2.9x slower                    |
| HonoJsx    | 1.05 ms   | 3.14 MB    | 2.9x slower                    |
| vHtml      | 2.06 ms   | 3.54 MB    | 5.7x slower, different output  |
| TypedHtml  | 2.11 ms   | 7.13 MB    | 5.8x slower, different output  |
| CommonTags | 3.58 ms   | 6.30 MB    | 9.9x slower, template engine   |
| Jsxte      | 3.95 ms   | 13.94 MB   | 10.9x slower, different output |
| Ghtml      | 230.79 µs | 0.65 MB    | template engine, 204.5 KiB     |
| HonoHtml   | 118.12 µs | 0.55 MB    | template engine, 204.5 KiB     |

Libraries marked "different output" produce HTML that differs from React's output for the
same input. Libraries marked "template engine" use tagged template literals instead of JSX
and produce larger output for the same logical content.

## Methodology

The RealWorldPage benchmark is the most meaningful because it renders a full component
tree. Template engines such as Ghtml and HonoHtml are faster because they concatenate
template strings without a function call per element. In exchange, element and attribute
names are not type-checked, and the `@kitajs/ts-html-plugin` XSS diagnostics do not apply
to them. Every JSX library pays one function call per element, so the JSX rows compare
like with like.

## Implementation details

The performance comes from building strings directly. The runtime uses
character-by-character loops for HTML escaping instead of regex replacements, checks
before converting (regex test before expensive operations), and orders void element checks
by frequency. When running on Bun, the runtime delegates escaping to Bun's native
`escapeHTML` implementation.
