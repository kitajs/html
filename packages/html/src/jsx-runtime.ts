import type { Children } from './index.js'
import { Fragment, renderElement } from './index.js'

/**
 * Generates a html string from an attribute name of component and it's props.
 *
 * This function is meant to be used by the jsx runtime and should not be called directly.
 *
 * @param name The name of the element to create or another component function
 * @param attributes The props to apply to the component
 * @returns The generated html string or a promise that resolves to the generated html
 *   string
 */
export function jsx(
  this: void,
  name: string | Function,
  attributes: { children?: Children; [k: string]: any }
): JSX.Element {
  // Calls the element creator function if the name is a function
  if (typeof name === 'function') {
    return name(attributes)
  }

  return renderElement(name, attributes)
}

/**
 * Generates a html string from an attribute name of component and it's props.
 *
 * This function is meant to be used by the jsx runtime and should not be called directly.
 *
 * @param name The name of the element to create or another component function
 * @param attributes The props to apply to the component
 * @returns The generated html string or a promise that resolves to the generated html
 *   string
 */
export function jsxs(
  this: void,
  name: string | Function,
  attributes: { children: Children[]; [k: string]: any }
): JSX.Element {
  // Calls the element creator function if the name is a function
  if (typeof name === 'function') {
    return name(attributes)
  }

  return renderElement(name, attributes)
}

// According to the jsx-runtime spec we must export the fragment element also
export { Fragment }
