const { DOCTYPE_HTML } = require('./constants');
const { isTagHtml } = require('./is-tag-html');

/**
 * Prepends doctype only in full html strings, because routes that returns only a fragment
 * of html (a.k.a components or partials) should not have a doctype attached to them.
 *
 * @param {string} html
 * @returns {string}
 */
module.exports.prependDoctype = function prependDoctype(html) {
  return typeof html === 'string' && isTagHtml(html) ? DOCTYPE_HTML + html : html;
};
