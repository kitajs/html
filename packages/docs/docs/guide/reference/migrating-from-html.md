---
description:
  Convert HTML templates to JSX by fixing attributes, void elements, comments, styles, and
  multiple roots.
---

# Migrating from HTML

Converting existing HTML templates to JSX requires a few mechanical transformations.

## Automated conversion

Use [Html To Jsx](https://magic.reactjs.net/htmltojsx.htm) for bulk conversion. Paste HTML
and receive JSX output.

## Manual conversion rules

Unlike React, Kita Html uses standard HTML attribute names. `class` stays as `class`, not
`className`. `for` stays as `for`, not `htmlFor`.

Void elements must be explicitly self-closed: `<br>` becomes `<br />`, `<img src="...">`
becomes `<img src="..." />`.

HTML comments become JSX comments: `<!-- comment -->` becomes `{/* comment */}`.

Inline styles can remain as strings. Kita Html accepts `style="color: red"` directly,
unlike React which requires an object.

Multiple root elements must be wrapped in a fragment:

```tsx
// HTML
<div>First</div>
<div>Second</div>

// JSX
<>
  <div>First</div>
  <div>Second</div>
</>
```
