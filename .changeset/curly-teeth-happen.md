---
'@kitajs/html-cli': patch
---

Fix `safe` attribute checks and Windows startup:

- Treat `safe={true}` like a bare `safe` attribute.
- Stop reporting TS88604 when another child of the element still needs escaping, as in
  `<p safe>{name}{count}</p>`.
- Report TS88602 instead of TS88604 when a `safe` element both double escapes and has safe
  children.
- Skip oclif's shell detection on Windows, which spawned PowerShell on every run and took
  seconds before the check started.
- Treat an empty `FORCE_COLOR` as forcing colors and `FORCE_COLOR=0` or `false` as turning
  them off, as Node.js does.
