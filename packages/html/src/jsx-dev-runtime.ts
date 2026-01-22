import type { Children } from './index.js';
import { jsx } from './jsx-runtime.js';

export { Fragment, jsx, jsxs } from './jsx-runtime.js';

/**
 * Generates a html string from an attribute name of component and it's props.
 *
 * This function is meant to be used by the jsx runtime and should not be called directly.
 *
 * @param name The name of the element to create or another component function
 * @param attributes The props to apply to the component
 * @retuns The generated html string or a promise that resolves to the generated html string
 */
export function jsxDEV(
  this: void,
  name: string | Function,
  attributes: { children?: Children; [k: string]: any }
): JSX.Element {
  return jsx(name, attributes);
}
