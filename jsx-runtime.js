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
    name = String(attrs.of);
  }

  const attributes = attributesToString(attrs);

  if (attrs.children === undefined) {
    if (isVoidElement(name)) {
      return '<' + name + attributes + '/>';
    }

    return '<' + name + attributes + '></' + name + '>';
  }

  const contents = contentToString(attrs.children, !!attrs.safe);

  // Faster than checking if `children instanceof Promise`
  // https://jsperf.app/zipuvi
  if (typeof contents === 'string') {
    return '<' + name + attributes + '>' + contents + '</' + name + '>';
  }

  return contents.then(function resolveContents(child) {
    return '<' + name + attributes + '>' + child + '</' + name + '>';
  });
}

/** @type {import('./jsx-runtime').jsxs} */
function jsxs(name, attrs) {
  // Calls the element creator function if the name is a function
  if (typeof name === 'function') {
    return name(attrs);
  }

  // Switches the tag name when this custom `tag` is present.
  if (name === 'tag') {
    name = String(attrs.of);
  }

  const attributes = attributesToString(attrs);

  if (attrs.children.length === 0) {
    if (isVoidElement(name)) {
      return '<' + name + attributes + '/>';
    }

    return '<' + name + attributes + '></' + name + '>';
  }

  const contents = contentsToString(attrs.children, !!attrs.safe);

  // Faster than checking if `children instanceof Promise`
  // https://jsperf.app/zipuvi
  if (typeof contents === 'string') {
    return '<' + name + attributes + '>' + contents + '</' + name + '>';
  }

  return contents.then(function resolveContents(child) {
    return '<' + name + attributes + '>' + child + '</' + name + '>';
  });
}

const JsxRuntime = {
  jsx,
  jsxs,

  // According to the jsx-runtime spec we must export the fragment element also
  Fragment
};

module.exports = JsxRuntime;
module.exports.default = JsxRuntime;
module.exports.default = JsxRuntime;
