# CSS Variables Reference

Complete list of CSS variables exposed by Rspress for theme customization. Override these
in `theme/index.css` or via `globalStyles` in `rspress.config.ts`.

For dark mode overrides, wrap variables in `.dark { ... }`.

Official reference: <https://rspress.rs/ui/vars>

---

## Brand Colors

| Variable               | Light Default               | Dark Default |
| ---------------------- | --------------------------- | ------------ |
| `--rp-c-brand`         | `#0095ff`                   | (same)       |
| `--rp-c-brand-light`   | `#33adff`                   | (same)       |
| `--rp-c-brand-lighter` | `#c6e0fd`                   | (same)       |
| `--rp-c-brand-dark`    | `#0077ff`                   | (same)       |
| `--rp-c-brand-darker`  | `#005fcc`                   | (same)       |
| `--rp-c-brand-tint`    | `rgba(127, 163, 255, 0.16)` | (same)       |

## Background

| Variable         | Light Default | Dark Default |
| ---------------- | ------------- | ------------ |
| `--rp-c-bg`      | `#ffffff`     | `#121212`    |
| `--rp-c-bg-soft` | `#f8f8f9`     | `#292e37`    |
| `--rp-c-bg-mute` | `#f1f1f1`     | `#343a46`    |
| `--rp-c-bg-alt`  | `#fff`        | `#000`       |

## Text

| Variable                  | Light Default               | Dark Default                |
| ------------------------- | --------------------------- | --------------------------- |
| `--rp-c-text-0`           | `#000000`                   | `#ffffff`                   |
| `--rp-c-text-1`           | `#242424`                   | `rgba(255, 255, 245, 0.93)` |
| `--rp-c-text-2`           | `rgba(0, 0, 0, 0.7)`        | `rgba(255, 255, 245, 0.65)` |
| `--rp-c-text-3`           | `rgba(60, 60, 60, 0.33)`    | `rgba(235, 235, 235, 0.38)` |
| `--rp-c-text-4`           | `rgba(60, 60, 60, 0.18)`    | `rgba(235, 235, 235, 0.18)` |
| `--rp-c-text-code`        | `#476582`                   | `#c9def1`                   |
| `--rp-c-text-code-bg`     | `rgba(153, 161, 179, 0.08)` | `rgba(255, 255, 255, 0.08)` |
| `--rp-c-text-code-border` | `rgba(0, 0, 0, 0.05)`       | `rgba(255, 255, 255, 0.05)` |
| `--rp-c-link`             | `var(--rp-c-brand-dark)`    | `var(--rp-c-brand-light)`   |

## Dividers

| Variable               | Light Default         | Dark Default             |
| ---------------------- | --------------------- | ------------------------ |
| `--rp-c-divider`       | `rgba(0, 0, 0, 0.25)` | `rgba(84, 84, 84, 0.65)` |
| `--rp-c-divider-light` | `rgba(0, 0, 0, 0.12)` | `rgba(84, 84, 84, 0.48)` |

## Gray Scale

| Variable              | Default   |
| --------------------- | --------- |
| `--rp-c-gray`         | `#8e8e8e` |
| `--rp-c-gray-light-1` | `#aeaeae` |
| `--rp-c-gray-light-2` | `#c7c7c7` |
| `--rp-c-gray-light-3` | `#d1d1d1` |
| `--rp-c-gray-light-4` | `#e5e5e5` |
| `--rp-c-gray-light-5` | `#f2f2f2` |

## Layout (Radius & Shadows)

| Variable                                | Default                |
| --------------------------------------- | ---------------------- |
| `--rp-radius`                           | `1rem`                 |
| `--rp-radius-small`                     | `0.5rem`               |
| `--rp-radius-large`                     | `1.5rem`               |
| `--rp-shadow-1` through `--rp-shadow-5` | 5 levels of box-shadow |

## Code Block

| Variable                 | Light Default                         | Dark Default         |
| ------------------------ | ------------------------------------- | -------------------- |
| `--rp-code-font-size`    | `0.875rem`                            | (same)               |
| `--rp-code-title-bg`     | `#f8f8f9`                             | `#191919`            |
| `--rp-code-block-color`  | `rgb(46, 52, 64)`                     | `rgb(229, 231, 235)` |
| `--rp-code-block-bg`     | `var(--rp-c-bg)`                      | (same)               |
| `--rp-code-block-border` | `1px solid var(--rp-c-divider-light)` | (same)               |
| `--rp-code-block-shadow` | `none`                                | (same)               |

## Shiki Syntax Highlighting

### Light Mode

| Variable                          | Default              |
| --------------------------------- | -------------------- |
| `--shiki-foreground`              | `inherit`            |
| `--shiki-background`              | `transparent`        |
| `--shiki-token-constant`          | `#1976d2`            |
| `--shiki-token-string`            | `#31a94d`            |
| `--shiki-token-comment`           | `rgb(182, 180, 180)` |
| `--shiki-token-keyword`           | `#cf2727`            |
| `--shiki-token-parameter`         | `#f59403`            |
| `--shiki-token-function`          | `#7041c8`            |
| `--shiki-token-string-expression` | `#218438`            |
| `--shiki-token-punctuation`       | `#242323`            |
| `--shiki-token-link`              | `#22863a`            |
| `--shiki-token-deleted`           | `#d32828`            |
| `--shiki-token-inserted`          | `#22863a`            |

### Dark Mode

| Variable                          | Default   |
| --------------------------------- | --------- |
| `--shiki-token-constant`          | `#6fb0fa` |
| `--shiki-token-string`            | `#f9a86e` |
| `--shiki-token-comment`           | `#6a727b` |
| `--shiki-token-keyword`           | `#f47481` |
| `--shiki-token-parameter`         | `#ff9800` |
| `--shiki-token-function`          | `#ae8eeb` |
| `--shiki-token-string-expression` | `#4fb74d` |
| `--shiki-token-punctuation`       | `#bbbbbb` |
| `--shiki-token-link`              | `#f9a76d` |
| `--shiki-token-deleted`           | `#ee6d7a` |
| `--shiki-token-inserted`          | `#36c47f` |

## Home Page

| Variable                         | Light Default                              | Dark Default                                    |
| -------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| `--rp-home-hero-secondary-color` | `#a673ff`                                  | (same)                                          |
| `--rp-home-hero-title-color`     | `transparent`                              | (same)                                          |
| `--rp-home-hero-title-bg`        | gradient (90deg)                           | (same)                                          |
| `--rp-home-background-bg`        | radial gradients                           | dark radial gradients                           |
| `--rp-home-feature-bg`           | `linear-gradient(135deg, #fff, #f9f9f980)` | `linear-gradient(135deg, #ffffff00, #ffffff08)` |

## Quick Start Example

```css
/* theme/index.css */
:root {
  --rp-c-brand: #7c3aed;
  --rp-c-brand-light: #8b5cf6;
  --rp-c-brand-dark: #6d28d9;
}
.dark {
  --rp-c-brand: #a78bfa;
  --rp-c-brand-light: #c4b5fd;
  --rp-c-brand-dark: #8b5cf6;
}
```
