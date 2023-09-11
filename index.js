/// <reference path="./jsx.d.ts" />

/**
 * A const used to represent a html fragment.
 *
 * @typedef {import('.').Fragment}
 */
const Fragment = Symbol.for('kHtmlFragment')

/**
 * Returns true if the character at the given index is an uppercase character.
 *
 * @param {string} input the string to check.
 * @param {number} index the index of the character to check.
 * @returns {boolean} if the character at the given index is an uppercase character.
 * @this {void}
 */
function isUpper (input, index) {
  const code = input.charCodeAt(index)
  return code >= 65 /* A */ && code <= 90 /* Z */
}

/**
 * Converts a camel cased string to a kebab cased string.
 *
 * @param {string} camel the camel cased string to convert.
 * @this {void}
 */
function toKebabCase (camel) {
  const length = camel.length

  let start = 0
  let end = 0
  let kebab = ''
  let prev = true
  let curr = isUpper(camel, 0)
  let next

  for (; end < length; end++) {
    next = isUpper(camel, end + 1)

    // detects the start of a new camel case word and avoid lowercasing abbreviations.
    if (!prev && curr && !next) {
      // @ts-expect-error - this indexing is safe.
      kebab += camel.slice(start, end) + '-' + camel[end].toLowerCase()
      start = end + 1
    }

    prev = curr
    curr = next
  }

  // Appends the remaining string.
  kebab += camel.slice(start, end)

  return kebab
}

/**
 * Escapes a string for use in an HTML attribute value.
 *
 * @param {any} value the value to escape. If the value is not a string it will be converted to a string with `toString()` or `toISOString()` if it is a Date.
 * @returns {string} the escaped string.
 * @this {void}
 */
function escapeHtml (value) {
  // Handle non string values
  if (typeof value !== 'string') {
    // HTML Dates can just be ISO stringified
    if (value instanceof Date) {
      return value.toISOString()
    }

    // Calls toString() on the value
    value = String(value)
  }

  const length = value.length
  let escaped = ''

  let start = 0
  let end = 0

  for (; end < length; end++) {
    switch (value[end]) {
      case '&':
        escaped += value.slice(start, end) + '&amp;'
        start = end + 1
        continue
      case '>':
        escaped += value.slice(start, end) + '&gt;'
        start = end + 1
        continue
      case '<':
        escaped += value.slice(start, end) + '&lt;'
        start = end + 1
        continue
      case '"':
        escaped += value.slice(start, end) + '&#34;'
        start = end + 1
        continue
      case "'":
        escaped += value.slice(start, end) + '&#39;'
        start = end + 1
        continue
      // Non breaking space
      case '\u00A0':
        escaped += value.slice(start, end) + '&#32;'
        start = end + 1
        continue
    }
  }

  // Appends the remaining string.
  escaped += value.slice(start, end)

  return escaped
}

/**
 * Returns true if the element is a html void element.
 *
 * @param {string} tag the name of the element to check.
 * @returns {boolean} if the element is a html void element.
 * @this {void}
 */
function isVoidElement (tag) {
  // Ordered by most common to least common.
  return (
    tag === 'img' ||
    tag === 'input' ||
    tag === 'meta' ||
    tag === 'br' ||
    tag === 'hr' ||
    tag === 'link' ||
    tag === 'area' ||
    tag === 'base' ||
    tag === 'col' ||
    tag === 'command' ||
    tag === 'embed' ||
    tag === 'keygen' ||
    tag === 'param' ||
    tag === 'source' ||
    tag === 'track' ||
    tag === 'wbr'
  )
}

/**
 * Transforms an object of style attributes into a html style string.
 *
 * @param {object | string}  style
 * @returns {string}
 * @this {void}
 */
function styleToString (style) {
  if (typeof style === 'string') {
    return escapeHtml(style)
  }

  const keys = Object.keys(style)
  const length = keys.length

  let key
  let index = 0
  let result = ''

  for (; index < length; index++) {
    key = keys[index]

    // @ts-expect-error - this indexing is safe.
    result += toKebabCase(key) + ':' + escapeHtml(style[key]) + ';'
  }

  return result
}

/**
 * Transforms an object of attributes into a html attributes string.
 *
 * **This function does not support Date objects.**
 *
 * @example `a b="c" d="1"`
 *
 * @param {object} attributes a record of literal values to use as attributes.
 * @returns {string} the generated html attributes string.
 * @this {void}
 */
function attributesToString (attributes) {
  if (!attributes) {
    return ''
  }

  const keys = Object.keys(attributes)
  const length = keys.length

  let key, value, formattedName
  let result = ''
  let index = 0

  for (; index < length; index++) {
    key = keys[index]

    // Skips all @kitajs/html specific attributes.
    if (key === 'children' || key === 'safe') {
      continue
    }

    // @ts-expect-error - this indexing is safe.
    value = attributes[key]

    // React className compatibility.
    if (key === 'className') {
      // @ts-expect-error - both were provided, so use the class attribute.
      if (attributes.class !== undefined) {
        continue
      }

      key = 'class'
    }

    if (key === 'style') {
      result += ' style="' + styleToString(value) + '"'
      continue
    }

    // @ts-expect-error - this indexing is safe.
    formattedName = toKebabCase(key)

    if (typeof value === 'boolean') {
      // Only add the attribute if the value is true.
      if (value) {
        result += ' ' + formattedName
      }

      continue
    }

    if (value === null || value === undefined) {
      continue
    }

    result += ' ' + formattedName

    if (value !== '') {
      result += '="' + escapeHtml(value) + '"'
    }
  }

  return result
}

/**
 * Joins raw string html elements into a single html string.
 *
 * A raw html fragment is just an array of strings, this method concatenates .
 *
 * @param {import('.').Children[]} contents an maybe nested array of strings to concatenate.
 * @param {boolean} [escape=false] if we should escape the contents before concatenating them.
 * @returns {string} the concatenated and escaped string of contents.
 * @this {void}
 */
function contentsToString (contents, escape) {
  const length = contents.length

  if (length === 0) {
    return ''
  }

  let result = ''
  let content
  let index = 0

  for (; index < length; index++) {
    content = contents[index]

    // Ignores non 0 falsy values
    if (!content && content !== 0) {
      continue
    }

    if (Array.isArray(content)) {
      result += contentsToString(content, escape)
    } else if (escape === true) {
      result += escapeHtml(content)
    } else {
      result += content
    }
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
function createElement (name, attrs, ...children) {
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
    return contentsToString(children)
  }

  // Switches the tag name when this custom `tag` is present.
  if (name === 'tag') {
    name = String(attrs.of)
    delete attrs.of
  }

  if (children.length === 0 && isVoidElement(name)) {
    return '<' + name + attributesToString(attrs) + '/>'
  }

  return (
    '<' +
    name +
    attributesToString(attrs) +
    '>' +
    contentsToString(children, attrs.safe) +
    '</' +
    name +
    '>'
  )
}

/**
 * Compiles html with the given arguments specified with $name syntax.
 *
 * @param {(proxy: any) => string} htmlFn
 * @param {boolean} [strict=true] if we should throw an error when a property is not found.
 * @returns {function} the compiled template function
 * @this {void}
 */
function compile (htmlFn, strict = true, separator = '/*\x00*/') {
  if (typeof htmlFn !== 'function') {
    throw new Error('The first argument must be a function.')
  }

  const properties = new Set()

  const html = htmlFn(new Proxy({}, {
    get (_, name) {
      // Adds the property to the set of known properties.
      properties.add(name)

      const isChildren = name === 'children'
      let access = `args[${separator}\`${name.toString()}\`${separator}]`

      // Adds support to render multiple children
      if (isChildren) {
        access = `Array.isArray(${access}) ? ${access}.join(${separator}\` \`${separator}) : ${access}`
      }

      // Uses ` to avoid content being escaped.
      return `\`${separator} + (${access} || ${strict && !isChildren ? `throwPropertyNotFound(${separator}\`${name.toString()}\`${separator})` : `${separator}\`\`${separator}`}) + ${separator}\``
    }
  }))

  const sepLength = separator.length
  const length = html.length

  // Adds the throwPropertyNotFound function if strict
  let body = ''
  let nextStart = 0
  let index = 0

  // Escapes every ` without separator
  for (; index < length; index++) {
    // Escapes the backtick character because it will be used to wrap the string
    // in a template literal.
    if (
      html[index] === '`' &&
      html.slice(index - sepLength, index) !== separator &&
      html.slice(index + 1, index + sepLength + 1) !== separator
    ) {
      body += html.slice(nextStart, index) + '\\`'
      nextStart = index + 1
      continue
    }

    // Escapes the backslash character because it will be used to escape the
    // backtick character.
    if (html[index] === '\\') {
      body += html.slice(nextStart, index) + '\\\\'
      nextStart = index + 1
      continue
    }
  }

  // Adds the remaining string
  body += html.slice(nextStart)

  if (strict) {
    // eslint-disable-next-line no-new-func
    return Function('args',
    // Checks for args presence
      'if (args === undefined) { throw new Error("The arguments object was not provided.") };\n' +
    // Function to throw when a property is not found
    'function throwPropertyNotFound(name) { throw new Error("Property " + name + " was not provided.") };\n' +
    // Concatenates the body
    `return \`${body}\``
    )
  }

  // eslint-disable-next-line no-new-func
  return Function('args',
    // Adds a empty args object when it is not present
    'if (args === undefined) { args = Object.create(null) };\n' + `return \`${body}\``
  )
}

module.exports.escapeHtml = escapeHtml
module.exports.isVoidElement = isVoidElement
module.exports.attributesToString = attributesToString
module.exports.toKebabCase = toKebabCase
module.exports.isUpper = isUpper
module.exports.styleToString = styleToString
module.exports.createElement = createElement
module.exports.h = createElement
module.exports.contentsToString = contentsToString
module.exports.compile = compile
module.exports.Fragment = Fragment

// esModule interop
Object.defineProperty(exports, '__esModule', { value: true })
module.exports.default = Object.assign({}, module.exports)
