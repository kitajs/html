---
'@kitajs/html': major
---

Fix `style` object keys to match React: CSS custom properties (`--mainColor`) keep their
name instead of being converted to kebab-case, vendor prefixed keys (`WebkitTransition`,
`msTransform`) render with a leading hyphen, and `JSX.CSSProperties` accepts custom
properties (#537)
