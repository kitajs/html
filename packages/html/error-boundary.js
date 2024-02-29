const { contentsToString } = require('./index');
const { setTimeout } = require('timers/promises');

const TIMEOUT_SYMBOL = Symbol.for('kHtmlTimeout');

/** @type {import('./error-boundary').isTimeoutError} */
function isTimeoutError(error) {
  // @ts-expect-error
  return error && error[TIMEOUT_SYMBOL];
}

/** @type {import('./error-boundary').ErrorBoundary} */
function ErrorBoundary(props) {
  // Joins the content into a string or promise of string
  let children = contentsToString([props.children]);

  // Sync children, just render them
  if (typeof children === 'string') {
    return children;
  }

  // Adds race condition to children
  if (props.timeout) {
    children = Promise.race([
      children,
      setTimeout(props.timeout).then(function reject() {
        const error = new Error('Children timed out.');
        // @ts-expect-error - should be internal
        error[TIMEOUT_SYMBOL] = true;
        throw error;
      })
    ]);
  }

  // If the error boundary itself throws another error, there's nothing
  // we can do, so we just re-throw it.
  return children.catch(function errorBoundary(error) {
    if (typeof props.catch === 'function') {
      return props.catch(error);
    }

    return props.catch;
  });
}

module.exports.ErrorBoundary = ErrorBoundary;
module.exports.isTimeoutError = isTimeoutError;
