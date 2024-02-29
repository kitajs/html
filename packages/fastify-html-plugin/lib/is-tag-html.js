const { HTML_TAG_LENGTH, HTML_TAG } = require('./constants');

/**
 * Returns true if the string starts with `<html`, **ignores whitespace and casing**.
 *
 * @param {string} value
 * @this {void}
 */
module.exports.isTagHtml = function isTagHtml(value) {
  return (
    value
      // remove whitespace from the start of the string
      .trimStart()
      // get the first 5 characters
      .slice(0, HTML_TAG_LENGTH)
      // compare to `<html`
      .toLowerCase() === HTML_TAG
  );
};
