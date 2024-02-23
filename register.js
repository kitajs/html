'use strict';

console.warn(
  'The register.js file is deprecated and will be removed in the next major version. See here https://github.com/kitajs/html?tab=readme-ov-file#deprecating-global-register-global-html-object for more information.'
);

// Finds the global object (window in browsers)
let root;
try {
  root = Function('return this')();
  /* c8 ignore next 3 */
} catch (_) {
  root = window;
}

// Avoids multiple registrations
if (!root.Html) {
  root.Html = require('./index');
}

// Removes the default export wrapper
if (root.Html.default) {
  root.Html = root.Html.default;
}
