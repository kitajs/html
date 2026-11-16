---
'@kitajs/html': patch
---

Fix children that are thenables but not native promises, such as query builders, rendering
as `undefined` or `[object Object]` instead of their resolved value
