---
'@kitajs/ts-html-plugin': patch
---

Make the `xss-scan` / `ts-html-plugin` CLI exit with a non-zero status code when it
crashes. Previously an uncaught error in `main()` was only logged and the process exited
`0`, so a crash (e.g. at startup) was reported as a passing scan in CI and verification
hooks.
