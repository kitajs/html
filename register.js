'use strict';

process.emitWarning(
  'The `@kitajs/html/register` import has been DEPRECATED and will be removed in the next major version. See https://github.com/kitajs/html#deprecating-global-register',
  'DeprecationWarning',
  'KTHTML_DEP'
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
