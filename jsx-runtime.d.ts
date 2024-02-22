import type { Children, Fragment } from './index';

/**
 * Generates a html string from the given contents.
 *
 * // TODO: JSDOC
 */
export function jsx(
  this: void,
  name: string | Function,
  attributes: { children?: Children; [k: string]: any }
): JSX.Element;

/**
 * Generates a html string from the given contents.
 *
 * // TODO: JSDOC
 */
export function jsxs(
  this: void,
  name: string | Function,
  attributes: { children: Children[]; [k: string]: any }
): JSX.Element;

export { Fragment };
