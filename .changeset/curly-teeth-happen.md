---
'@kitajs/html-cli': patch
---

Treat `safe={true}` like a bare `safe` attribute, stop reporting TS88604 when another
child of the element still needs escaping (as in `<p safe>{name}{count}</p>`), and report
TS88602 instead of TS88604 when a `safe` element both double escapes and has safe children
