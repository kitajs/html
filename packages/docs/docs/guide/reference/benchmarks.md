# Benchmarks

Kita Html is a string builder. The most representative way to measure its performance is
through micro benchmarks that compare string generation speed against other HTML builders.

## Results

Benchmarked against React, Typed Html, Common Tags, and GHtml on a 13th Gen Intel Core
i5-13600K running Node.js v20.11.0. Run `pnpm bench` in the repository root to reproduce.

### Many Components (31.4 KB output)

| Library     | Time (avg) | Relative    |
| ----------- | ---------- | ----------- |
| Kita Html   | 98 us      | 1x          |
| Typed Html  | 738 us     | 7.5x slower |
| GHtml       | 753 us     | 7.6x slower |
| Common Tags | 2,815 us   | 28x slower  |
| React       | 4,119 us   | 42x slower  |

### Many Props (7.4 KB output)

| Library     | Time (avg) | Relative    |
| ----------- | ---------- | ----------- |
| Kita Html   | 18 us      | 1x          |
| GHtml       | 42 us      | 2.3x slower |
| Common Tags | 43 us      | 2.3x slower |
| React       | 71 us      | 3.8x slower |
| Typed Html  | 76 us      | 4.1x slower |

### MDN Homepage (66.7 KB output)

| Library     | Time (avg) | Relative    |
| ----------- | ---------- | ----------- |
| Kita Html   | 14,981 us  | 1x          |
| Typed Html  | 28,667 us  | 1.9x slower |
| GHtml       | 37,052 us  | 2.5x slower |
| Common Tags | 39,634 us  | 2.6x slower |
| React       | 94,917 us  | 6.3x slower |

## Methodology

The benchmarks aim to represent real-world usage with component trees of realistic size.
Tagged template libraries like GHtml have an inherent advantage when rendering a single
template call, as there is no function call overhead per element. The JSX-based benchmarks
reflect the per-element function call cost that any JSX library incurs.

## Why it is fast

The performance comes from the string-only architecture. There is no object tree
construction, no diffing, and no serialization step. The runtime uses
character-by-character loops for HTML escaping instead of regex replacements, checks
before converting (regex test before expensive operations), and orders void element checks
by frequency. When running on Bun, the runtime delegates escaping to Bun's native
`escapeHTML` implementation.
