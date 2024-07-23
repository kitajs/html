/// <reference path="./jsx.d.ts" />
/// <reference types="./suspense.d.ts" />
/// <reference types="./error-boundary.d.ts" />

const ESCAPED_REGEX = /[<"'&]/;
const CAMEL_REGEX = /[a-z][A-Z]/;

/** @type {import('.').isUpper} */
function isUpper(input, index) {
  const code = input.charCodeAt(index);
  return code >= 65 /* A */ && code <= 90; /* Z */
}

/** @type {import('.').toKebabCase} */
function toKebabCase(camel) {
  // This is a optimization to avoid the whole conversion process when the
  // string does not contain any uppercase characters.
  if (!CAMEL_REGEX.test(camel)) {
    return camel;
  }

  const length = camel.length;

  let start = 0,
    end = 0,
    kebab = '',
    prev = true,
    curr = isUpper(camel, 0),
    next;

  for (; end < length; end++) {
    next = isUpper(camel, end + 1);

    // detects the start of a new camel case word and avoid lowercasing abbreviations.
    if (!prev && curr && !next) {
      // @ts-expect-error - this indexing is safe.
      kebab += camel.slice(start, end) + '-' + camel[end].toLowerCase();
      start = end + 1;
    }

    prev = curr;
    curr = next;
  }

  // Appends the remaining string.
  kebab += camel.slice(start, end);

  return kebab;
}

/** @type {import('.').escape} */
function escape(strings, ...values) {
  const stringsLength = strings.length,
    valuesLength = values.length;

  let index = 0,
    result = '';

  for (; index < stringsLength; index++) {
    result += strings[index];

    if (index < valuesLength) {
      result += values[index];
    }
  }

  // Escape the entire string at once.
  // This is faster than escaping each piece individually.
  return escapeHtml(result);
}

/** @type {import('.').escapeHtml} */
let escapeHtml = function (value) {
  if (typeof value !== 'string') {
    value = value.toString();
  }

  // This is a optimization to avoid the whole conversion process when the
  // string does not contain any uppercase characters.
  if (!ESCAPED_REGEX.test(value)) {
    return value;
  }

  const length = value.length;

  let escaped = '',
    start = 0,
    end = 0;

  // Escapes double quotes to be used inside attributes
  // Faster than using regex
  // https://jsperf.app/kakihu
  for (; end < length; end++) {
    // https://wonko.com/post/html-escaping
    switch (value[end]) {
      case '&':
        escaped += value.slice(start, end) + '&amp;';
        start = end + 1;
        continue;
      // We don't need to escape > because it is only used to close tags.
      // https://stackoverflow.com/a/9189067
      case '<':
        escaped += value.slice(start, end) + '&lt;';
        start = end + 1;
        continue;
      case '"':
        escaped += value.slice(start, end) + '&#34;';
        start = end + 1;
        continue;
      case "'":
        escaped += value.slice(start, end) + '&#39;';
        start = end + 1;
        continue;
    }
  }

  // Appends the remaining string.
  escaped += value.slice(start, end);

  return escaped;
};

/* c8 ignore next 2 */
// @ts-ignore - bun runtime have its own escapeHTML function.
if (typeof Bun !== 'undefined') escapeHtml = Bun.escapeHTML;

/** @type {import('.').isVoidElement} */
function isVoidElement(tag) {
  // Ordered by most common to least common.
  return (
    tag === 'meta' ||
    tag === 'link' ||
    tag === 'img' ||
    tag === 'br' ||
    tag === 'input' ||
    tag === 'hr' ||
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
  );
}

/** @type {import('.').styleToString} */
function styleToString(style) {
  // Faster escaping process that only looks for the " character.
  // As we use the " character to wrap the style string, we need to escape it.
  if (typeof style === 'string') {
    let end = style.indexOf('"');

    // This is a optimization to avoid having to look twice for the " character.
    // And make the loop already start in the middle
    if (end === -1) {
      return style;
    }

    const length = style.length;

    let escaped = '',
      start = 0;

    // Escapes double quotes to be used inside attributes
    // Faster than using regex
    // https://jsperf.app/kakihu
    for (; end < length; end++) {
      if (style[end] === '"') {
        escaped += style.slice(start, end) + '&#34;';
        start = end + 1;
      }
    }

    // Appends the remaining string.
    escaped += style.slice(start, end);

    return escaped;
  }

  const keys = Object.keys(style),
    length = keys.length;

  let key,
    value,
    end,
    start,
    index = 0,
    result = '';

  for (; index < length; index++) {
    key = keys[index];
    // @ts-expect-error - this indexing is safe.
    value = style[key];

    if (value === null || value === undefined) {
      continue;
    }

    // @ts-expect-error - this indexing is safe.
    result += toKebabCase(key) + ':';

    // Only needs escaping when the value is a string.
    if (typeof value !== 'string') {
      result += value.toString() + ';';
      continue;
    }

    end = value.indexOf('"');

    // This is a optimization to avoid having to look twice for the " character.
    // And make the loop already start in the middle
    if (end === -1) {
      result += value + ';';
      continue;
    }

    const length = value.length;
    start = 0;

    // Escapes double quotes to be used inside attributes
    // Faster than using regex
    // https://jsperf.app/kakihu
    for (; end < length; end++) {
      if (value[end] === '"') {
        result += value.slice(start, end) + '&#34;';
        start = end + 1;
      }
    }

    // Appends the remaining string.
    result += value.slice(start, end) + ';';
  }

  return result;
}

/** @type {import('.').attributesToString} */
function attributesToString(attributes) {
  const keys = Object.keys(attributes);
  const length = keys.length;

  let key,
    value,
    type,
    end,
    start,
    classItems,
    valueLength,
    result = '',
    index = 0;

  for (; index < length; index++) {
    key = keys[index];

    // Skips all @kitajs/html specific attributes.
    if (key === 'children' || key === 'safe' || key === 'of') {
      continue;
    }

    // @ts-expect-error - this indexing is safe.
    value = attributes[key];

    // React className compatibility.
    if (key === 'className') {
      // @ts-expect-error - both were provided, so use the class attribute.
      if (attributes.class !== undefined) {
        continue;
      }

      key = 'class';
    } else if (key === 'class' && Array.isArray(value)) {
      classItems = value;
      valueLength = value.length;

      // Reuses the value variable
      value = '';

      for (let i = 0; i < valueLength; i++) {
        if (classItems[i] && classItems[i].length > 0) {
          if (value) {
            value += ' ' + classItems[i].trim();
          } else {
            value += classItems[i].trim();
          }
        }
      }

      // All attributes may have been disabled.
      if (value.length === 0) {
        continue;
      }
    } else if (key === 'style') {
      result += ' style="' + styleToString(value) + '"';
      continue;
    } else if (key === 'attrs') {
      if (typeof value === 'string') {
        result += ' ' + value;
      } else {
        result += attributesToString(value);
      }

      continue;
    }

    type = typeof value;

    if (type === 'boolean') {
      // Only add the attribute if the value is true.
      if (value) {
        result += ' ' + key;
      }

      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    result += ' ' + key;

    if (type !== 'string') {
      // Non objects are
      if (type !== 'object') {
        result += '="' + value.toString() + '"';
        continue;
      }

      // Dates are always safe
      if (value instanceof Date) {
        result += '="' + value.toISOString() + '"';
        continue;
      }

      // The object may have a overridden toString method.
      // Which results in a non escaped string.
      value = value.toString();
    }

    end = value.indexOf('"');

    // This is a optimization to avoid having to look twice for the " character.
    // And make the loop already start in the middle
    if (end === -1) {
      result += '="' + value + '"';
      continue;
    }

    result += '="';

    valueLength = value.length;
    start = 0;

    // Escapes double quotes to be used inside attributes
    // Faster than using regex
    // https://jsperf.app/kakihu
    for (; end < valueLength; end++) {
      if (value[end] === '"') {
        result += value.slice(start, end) + '&#34;';
        start = end + 1;
      }
    }

    // Appends the remaining string.
    result += value.slice(start, end) + '"';
  }

  return result;
}

/**
 * @type {import('.').contentsToString}
 * @returns {any}
 */
function contentsToString(contents, escape) {
  let length = contents.length;
  let result = '';

  for (let index = 0; index < length; index++) {
    const content = contents[index];

    switch (typeof content) {
      case 'string':
      case 'number':
      // Bigint is the only case where it differs from React.
      // where React renders a empty string and we render the whole number.
      case 'bigint':
        result += content;
        continue;
      case 'boolean':
        continue;
    }

    if (!content) {
      continue;
    }

    if (Array.isArray(content)) {
      contents.splice(index--, 1, ...content);
      length += content.length - 1;
      continue;
    }

    if (typeof content.then === 'function') {
      // @ts-ignore - Type instantiation is excessively deep and possibly infinite.
      return Promise.all(contents.slice(index)).then(function resolveContents(resolved) {
        resolved.unshift(result);
        return contentsToString(resolved, escape);
      });
    }

    throw new Error('Objects are not valid as a KitaJSX child');
  }

  // escapeHtml is faster with longer strings, that's
  // why we escape the entire result once
  if (escape === true) {
    return escapeHtml(result);
  }

  return result;
}

/**
 * @param {import('./index').Children} content
 * @param {boolean} safe
 * @returns {JSX.Element}
 */
function contentToString(content, safe) {
  switch (typeof content) {
    case 'string':
      return safe ? escapeHtml(content) : content;
    case 'number':
    // Bigint is the only case where it differs from React.
    // where React renders a empty string and we render the whole number.
    case 'bigint':
      return content.toString();
    case 'boolean':
      return '';
  }

  if (!content) {
    return '';
  }

  if (Array.isArray(content)) {
    return contentsToString(content, safe);
  }

  if (typeof content.then === 'function') {
    return content.then(function resolveContent(resolved) {
      return contentToString(resolved, safe);
    });
  }

  throw new Error('Objects are not valid as a KitaJSX child');
}

/**
 * Just to stop TS from complaining about the type.
 *
 * @type {import('.').createElement}
 * @param {any} name
 * @returns {any}
 */
function createElement(name, attrs, ...children) {
  const hasAttrs = attrs !== null;

  // Calls the element creator function if the name is a function
  if (typeof name === 'function') {
    // We at least need to pass the children to the function component. We may receive null if this
    // component was called without any children.
    if (!hasAttrs) {
      return name({ children: children.length > 1 ? children : children[0] });
    }

    attrs.children = children.length > 1 ? children : children[0];
    return name(attrs);
  }

  // Switches the tag name when this custom `tag` is present.
  if (hasAttrs && name === 'tag') {
    name = /** @type {string} */ (attrs.of);
  }

  const attributes = hasAttrs ? attributesToString(attrs) : '';

  if (children.length === 0) {
    return isVoidElement(name)
      ? '<' + name + attributes + '/>'
      : '<' + name + attributes + '></' + name + '>';
  }

  const contents = contentsToString(children, hasAttrs && attrs.safe);

  if (typeof contents === 'string') {
    return '<' + name + attributes + '>' + contents + '</' + name + '>';
  }

  return contents.then(function resolveContents(contents) {
    return '<' + name + attributes + '>' + contents + '</' + name + '>';
  });
}

/** @type {import('.').Fragment} */
function Fragment(props) {
  return contentsToString([props.children]);
}

exports.escape = escape;
exports.e = escape;
exports.escapeHtml = escapeHtml;
exports.isVoidElement = isVoidElement;
exports.attributesToString = attributesToString;
exports.toKebabCase = toKebabCase;
exports.isUpper = isUpper;
exports.styleToString = styleToString;
exports.createElement = createElement;
exports.h = createElement;
exports.contentsToString = contentsToString;
exports.contentToString = contentToString;
exports.Fragment = Fragment;
