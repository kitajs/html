/**
 * There's no real way to validate HTML, so this is a best guess.
 *
 * @param {JSX.Element} value
 * @returns {value is string}
 * @this {void}
 * @see https://stackoverflow.com/q/1732348
 * @see https://stackoverflow.com/q/11229831
 */
module.exports.isHtml = function isHtml(value) {
  if (typeof value !== 'string') {
    return false;
  }

  value = value.trim();
  const length = value.length;

  return (
    // Minimum html is 7 characters long: <a></a>
    length >= 7 &&
    // open tag
    value[0] === '<' &&
    // close tag
    value[length - 1] === '>'
  );
};
