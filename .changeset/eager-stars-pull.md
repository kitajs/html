---
'@kitajs/ts-html-plugin': patch
---

Deprecate the package in favor of `kita-html check` from `@kitajs/html-cli`, which runs on
TypeScript 7.1+. The package.json `deprecated` field and a warning printed by `xss-scan`
point to it. On TypeScript 7, `xss-scan` now exits with that pointer instead of crashing.

Detection fixes: `children` unions without a direct string member, such as
`children?: string[]`, are now checked member by member; arrays inside recursive type
aliases are checked by their element types; and recursive types no longer recurse forever.
`xss-scan` also no longer drops findings that share a position with a finding in another
file, and no longer truncates large reports when its output is piped
