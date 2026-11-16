---
'@kitajs/fastify-html-plugin': minor
---

Remove the value `identity` from `transfer-encoding` header, as `identity` is deprecated
per [RFC 7230](https://www.rfc-editor.org/rfc/rfc7230.html).
