---
'@kitajs/ts-html-plugin': patch
---

Deprecate the package (through the package.json `deprecated` field) and xss-scan in favor
of `kita-html check` from @kitajs/html-cli. xss-scan now exits with a pointer to it on
TypeScript 7 instead of crashing, no longer drops findings that share a position with a
finding in another file, and no longer truncates large reports when its output is piped
