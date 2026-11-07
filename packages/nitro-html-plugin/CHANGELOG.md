# @kitajs/nitro-html-plugin

## 5.0.0-next.0

### Minor Changes

- Add H3 HTML responses and convention-based Nitro v3 pages with Suspense streaming:
  - `@kitajs/h3-html-plugin` adds `event.html()` and the factory-safe
    `defineKitaHandler()`.
  - `@kitajs/nitro-html-plugin` registers `server/pages` files as lazy GET and HEAD routes
    and a root catch-all page as the Nitro renderer.
  - `@kitajs/html` relays every Suspense boundary failure under an async root to the
    response stream instead of raising unhandled rejections after the first one.
