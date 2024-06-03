/// <reference path="./jsx.d.ts" />
/// <reference types="./suspense.d.ts" />
/// <reference types="./error-boundary.d.ts" />

const {
  Fragment,
  attributesToString,
  isVoidElement,
  contentsToString,
  contentToString
} = require('./index');

/** @type {import('./jsx-runtime').jsx} */
function jsx(name, attrs) {
  // Calls the element creator function if the name is a function
  if (typeof name === 'function') {
    return name(attrs);
  }

  // Switches the tag name when this custom `tag` is present.
  if (name === 'tag') {
    name = /** @type {string} */ (attrs.of);
  }

  const attributes = attributesToString(attrs);

  if (attrs.children === undefined) {
    return isVoidElement(name)
      ? '<' + name + attributes + '/>'
      : '<' + name + attributes + '></' + name + '>';
  }

  const contents = contentToString(attrs.children, !!attrs.safe);

  if (contents instanceof Promise) {
    return contents.then(function resolveContents(child) {
      return '<' + name + attributes + '>' + child + '</' + name + '>';
    });
  }

  return '<' + name + attributes + '>' + contents + '</' + name + '>';
}

/** @type {import('./jsx-runtime').jsxs} */
function jsxs(name, attrs) {
  // Calls the element creator function if the name is a function
  if (typeof name === 'function') {
    return name(attrs);
  }

  // Switches the tag name when this custom `tag` is present.
  if (name === 'tag') {
    name = /** @type {string} */ (attrs.of);
  }

  const attributes = attributesToString(attrs);

  if (attrs.children.length === 0) {
    return isVoidElement(name)
      ? '<' + name + attributes + '/>'
      : '<' + name + attributes + '></' + name + '>';
  }

  const contents = contentsToString(attrs.children, !!attrs.safe);

  if (contents instanceof Promise) {
    return contents.then(function resolveContents(child) {
      return '<' + name + attributes + '>' + child + '</' + name + '>';
    });
  }

  return '<' + name + attributes + '>' + contents + '</' + name + '>';
}

exports.jsx = jsx;
exports.jsxs = jsxs;
// According to the jsx-runtime spec we must export the fragment element also
exports.Fragment = Fragment;
