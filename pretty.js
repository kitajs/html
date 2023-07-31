/// <reference path="./jsx.d.ts" />

const {
  Fragment,
  toKebabCase,
  isVoidElement,
  attributesToString
} = require('./index')

/**
 * Joins raw string html elements into a single html string.
 *
 * A raw html fragment is just an array of strings, this method concatenates .
 *
 * @param {import('.').Children[]} contents an maybe nested array of strings to concatenate.
 * @param {number} [nest=0] the current nesting level.
 * @returns {string} the concatenated string of contents.
 * @this {void}
 */
function contentsToString(contents, nest = 0) {
  const length = contents.length

  if (length === 0) {
    return ''
  }

  let content
  let nestIndex = 0
  let shouldNest = false

  // Finds if there is any html element in the contents.
  for (; nestIndex < length; nestIndex++) {
    content = contents[nestIndex]

    if (typeof content !== 'string') {
      content = contents[nestIndex] = String.prototype.toString.call(content)
    }

    if (content.includes('<')) {
      shouldNest = true
      break
    }
  }

  let newLine = '\n' + ' '.repeat(nest * 2)
  let result = ''
  let index = 0

  for (; index < length; index++) {
    content = contents[index]

    // Ignores non 0 falsy values
    if (!content && content !== 0) {
      continue
    }

    if (Array.isArray(content)) {
      content = contentsToString(content, nest)
    }

    // checks if the content is a raw html fragment
    if (shouldNest) {
      result += newLine
    }

    result += content
      // @ts-expect-error - content is string here
      .split('\n')
      .join(newLine)
  }

  // The last ending newLine should respect the previous nesting, not this one.
  if (shouldNest) {
    result += newLine.slice(0, -2)
  }

  return result
}

/**
 * Generates a html string from the given contents.
 *
 * @param {string | Function | typeof Fragment} name the name of the element to create or a function that creates the element.
 * @param {import('.').PropsWithChildren<any> | null} attrs a record of literal values to use as attributes. A property named `children` will be used as the children of the element.
 * @param  {...import('.').Children} children the inner contents of the element.
 * @returns {string} the generated html string.
 * @this {void}
 */
function createElement(name, attrs, ...children) {
  // Adds the children to the attributes if it is not present.
  if (attrs === null) {
    attrs = { children }
  }

  // Calls the element creator function if the name is a function
  if (typeof name === 'function') {
    // In case the children attributes is not present, add it as a property.
    if (attrs.children === undefined) {
      // When only a single child is present, unwrap it.
      if (children.length > 1) {
        attrs.children = children
      } else {
        attrs.children = children[0]
      }
    }

    return name(attrs)
  }

  if (name === Fragment) {
    // Fragments should not have newlines at the start or end.
    return contentsToString(children, 0).trim()
  }

  let tag = toKebabCase(name)

  // Switches the tag name when this custom `tag` is present.
  if (name === 'tag') {
    tag = String(attrs.of)
    delete attrs.of
  }

  if (children.length === 0 && isVoidElement(name)) {
    // Adds a space before the closing slash.
    return '<' + tag + attributesToString(attrs) + ' />'
  }

  return (
    '<' +
    tag +
    attributesToString(attrs) +
    '>' +
    contentsToString(children, 1) +
    '</' +
    tag +
    '>'
  )
}

// Re-exports the methods from index.js
Object.assign(module.exports, require('./index'))
module.exports.contentsToString = contentsToString
module.exports.createElement = createElement

// esModule interop
Object.defineProperty(exports, '__esModule', { value: true })
module.exports.default = Object.assign({}, module.exports)
