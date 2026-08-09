---
description:
  Format compact output with html-prettify and configure the legacy JSX transform when
  react-jsx is not used.
---

# Additional Configuration

## Formatting HTML output

Kita Html emits compact HTML strings with no whitespace or indentation. If you need
pretty-printed output for debugging or readability, use
[html-prettify](https://www.npmjs.com/package/html-prettify).

```tsx
import prettify from 'html-prettify'

const html = (
  <div>
    <div>1</div>
    <div>2</div>
  </div>
)

console.log(html)
// '<div><div>1</div><div>2</div></div>'

console.log(prettify(html))
// '<div>\n  <div>1</div>\n  <div>2</div>\n</div>'
```

## Legacy JSX transform

Kita Html can be used with the older `jsx: "react"` transform instead of
`jsx: "react-jsx"`. This requires manually importing the `Html` namespace in every file
that uses JSX.

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "Html.createElement",
    "jsxFragmentFactory": "Html.Fragment"
  }
}
```

```tsx title="Html import required"
import { Html } from '@kitajs/html'

const html = <div>Hello</div>
```

This approach has a slight performance penalty because TypeScript generates
`Html.createElement` calls with rest parameters for children, rather than the optimized
`jsx`/`jsxs` calls of the modern transform. Use the `react-jsx` transform unless you have
a specific reason not to.
