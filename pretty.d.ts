/// <reference path="./jsx.d.ts" />

import { createElement } from './index'

/**
 * Joins raw string html elements into a single html string.
 *
 * A raw html fragment is just an array of strings, this method concatenates.
 *
 * @param {(string | string[])[]} contents an maybe nested array of strings to concatenate.
 * @param {number} [nest=0] the current nesting level.
 * @returns {string} the concatenated string of contents.
 * @this {void}
 */
export function contentsToString(
  this: void,
  contents: (string | string[])[],
  nest?: number
): JSX.Element

export * from './index'