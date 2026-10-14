---
'@kitajs/ts-html-plugin': patch
---

Resolve tsconfig path to absolute in `xss-scan` CLI to avoid TypeScript 6 crash with
`rootDirs`/`outDir`.
