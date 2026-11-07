---
'@kitajs/html': patch
---

Scope streamed Suspense marker ids by request id to avoid collisions across multiple
streamed roots in the same document.

If you consume `SuspenseScript` output directly, note that fallback, template, and script
ids now include the request id prefix, and the client helper requires modern browser
support for `<template>.content` and `Element.remove()`.
