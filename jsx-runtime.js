const { createElement, Fragment } = require('./index');

// This is a helper function to ensure that children is always an array
/**
 * @type {(
 *   children: import('./index.d.ts').Children
 * ) => import('./index.d.ts').Children[]}
 */
function safeChildrenArray(children) {
  if (!children) {
    return [];
  }
  if (Array.isArray(children)) {
    return children;
  } else {
    return [children];
  }
}

// The jsx function is the main function that will be used to create elements
// when the jsx-runtime is used
/** @type {import('./jsx-runtime').jsx} */
function jsx(type, { children, ...props }) {
  if (typeof type === 'string') {
    // This is needed because the content of the element (aka children)
    // must be provided as sequential arguments to createElement
    // so in order to spread it safely we need to ensure that it is an array
    const childrenArray = safeChildrenArray(children);
    return createElement(type, props, ...childrenArray);
  }
  // Is a component function so we must call it
  return type({
    ...props,
    children
  });
}

// In this case we have no need to distingt between jsxs and jsx
module.exports.jsxs = jsx;
module.exports.jsx = jsx;

// According to the jsx-runtime spec we must export the fragment element also
module.exports.Fragment = Fragment;
