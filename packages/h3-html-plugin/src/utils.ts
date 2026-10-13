/**
 * Controls automatic doctype insertion for one H3 event.
 *
 * Change this symbol property inside a handler to override the plugin setting for one
 * response.
 */
export const kAutoDoctype: unique symbol = Symbol.for('h3-kita-html.autoDoctype')

/** Returns true when a string starts with an HTML root, ignoring whitespace and case. */
export const isTagHtml = RegExp.prototype.test.bind(/^\s*<html/i)
