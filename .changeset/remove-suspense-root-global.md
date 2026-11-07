---
'@kitajs/html': major
---

Remove the global `SUSPENSE_ROOT` in favor of the exported `SuspenseRoot` state object
from `@kitajs/html/suspense`.

If you were reading or mutating `globalThis.SUSPENSE_ROOT` directly, update that code to
import and use `SuspenseRoot` instead.
