'use strict'

// Finds the global object (window in browsers)
let root
try {
  // eslint-disable-next-line no-new-func
  root = Function('return this')()
} catch (_) {
  root = window
}

root.Html = require('./index')

// Removes the default export wrapper
if (root.Html.default) {
  root.Html = root.Html.default
}
