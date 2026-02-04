/**
 * This gets assigned to every reply instance. You can manually change this value to
 * `false` if you want to "hand pick" when or when not to add the doctype.
 */
export const kAutoDoctype: unique symbol = Symbol.for('fastify-kita-html.autoDoctype');

/** Returns true if the string starts with `<html`, **ignores whitespace and casing**. */
export const isTagHtml = RegExp.prototype.test.bind(/^\s*<html/i);
