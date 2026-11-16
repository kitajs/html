---
'@kitajs/html': patch
---

Fix `RangeError: Maximum call stack size exceeded` when a children array with more than
~120k items has siblings, and stop `contentsToString` from flattening the arrays it
receives in place
