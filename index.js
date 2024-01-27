/// <reference path="./jsx.d.ts" />

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

  let start = 0;
  let end = 0;
  let kebab = '';
  let prev = true;
  let curr = isUpper(camel, 0);
  let next;

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
  const stringsLength = strings.length;
  const valuesLength = values.length;

  let index = 0;
  let result = '';

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
  let escaped = '';

  let start = 0;
  let end = 0;

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

    let escaped = '';
    let start = 0;

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

  const keys = Object.keys(style);
  const length = keys.length;

  let key, value, end, start;
  let index = 0;
  let result = '';

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

  let key, value, type, end, start, classItems, valueLength;
  let result = '';
  let index = 0;

  for (; index < length; index++) {
    key = keys[index];

    // Skips all @kitajs/html specific attributes.
    if (key === 'children' || key === 'safe') {
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
  let content;
  let index = 0;

  for (; index < length; index++) {
    content = contents[index];

    if (typeof content !== 'string') {
      // Ignores non 0 falsy values
      if (!content && content !== 0) {
        continue;
      }

      // @ts-expect-error - Also accepts thenable objects, not only promises
      // https://jsperf.app/zipuvi
      if (content.then) {
        // @ts-expect-error - this is a promise
        return Promise.all(contents.slice(index)).then(
          function resolveAsyncContent(resolved) {
            resolved.unshift(result);
            return contentsToString(resolved, escape);
          }
        );
      }

      if (Array.isArray(content)) {
        contents.splice(index--, 1, ...content);
        length += content.length - 1;
        continue;
      }
    }

    result += content;
  }

  // escapeHtml is faster with longer strings, that's
  // why we escape the entire result once
  if (escape === true) {
    return escapeHtml(result);
  }

  return result;
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
      attrs = { children: children.length > 1 ? children : children[0] };
    } else if (attrs.children === undefined) {
      attrs.children = children.length > 1 ? children : children[0];
    }

    return name(attrs);
  }

  // Switches the tag name when this custom `tag` is present.
  if (hasAttrs && name === 'tag') {
    name = String(attrs.of);
    delete attrs.of;
  }

  const attributes = hasAttrs ? attributesToString(attrs) : '';

  if (children.length === 0 && isVoidElement(name)) {
    return '<' + name + attributes + '/>';
  }

  const contents = contentsToString(children, hasAttrs && attrs.safe);

  // Faster than checking if `children instanceof Promise`
  // https://jsperf.app/zipuvi
  if (typeof contents === 'string') {
    return '<' + name + attributes + '>' + contents + '</' + name + '>';
  }

  return contents.then(function asyncChildren(child) {
    return '<' + name + attributes + '>' + child + '</' + name + '>';
  });
}

/** @type {import('.').Fragment} */
function Fragment(props) {
  return Html.contentsToString([props.children]);
}

/**
 * Just to stop TS from complaining about the type.
 *
 * @type {import('.').compile}
 * @returns {Function}
 */
function compile(htmlFn, strict = true, separator = '/*\x00*/') {
  if (typeof htmlFn !== 'function') {
    throw new Error('The first argument must be a function.');
  }

  const properties = new Set();

  const html = htmlFn(
    // @ts-expect-error - this proxy will meet the props with children requirements.
    new Proxy(
      {},
      {
        get(_, name) {
          // Adds the property to the set of known properties.
          properties.add(name);

          const isChildren = name === 'children';
          let access = `args[${separator}\`${name.toString()}\`${separator}]`;

          // Adds support to render multiple children
          if (isChildren) {
            access = `Array.isArray(${access}) ? ${access}.join(${separator}\`\`${separator}) : ${access}`;
          }

          // Uses ` to avoid content being escaped.
          return `\`${separator} + (${access} || ${
            strict && !isChildren
              ? `throwPropertyNotFound(${separator}\`${name.toString()}\`${separator})`
              : `${separator}\`\`${separator}`
          }) + ${separator}\``;
        }
      }
    )
  );

  if (typeof html !== 'string') {
    throw new Error('You cannot use compile() with async components.');
  }

  const sepLength = separator.length;
  const length = html.length;

  // Adds the throwPropertyNotFound function if strict
  let body = '';
  let nextStart = 0;
  let index = 0;

  // Escapes every ` without separator
  for (; index < length; index++) {
    // Escapes the backtick character because it will be used to wrap the string
    // in a template literal.
    if (
      html[index] === '`' &&
      html.slice(index - sepLength, index) !== separator &&
      html.slice(index + 1, index + sepLength + 1) !== separator
    ) {
      body += html.slice(nextStart, index) + '\\`';
      nextStart = index + 1;
      continue;
    }
  }

  // Adds the remaining string
  body += html.slice(nextStart);

  if (strict) {
    return Function(
      'args',
      // Checks for args presence
      'if (args === undefined) { throw new Error("The arguments object was not provided.") };\n' +
        // Function to throw when a property is not found
        'function throwPropertyNotFound(name) { throw new Error("Property " + name + " was not provided.") };\n' +
        // Concatenates the body
        `return \`${body}\``
    );
  }

  return Function(
    'args',
    // Adds a empty args object when it is not present
    'if (args === undefined) { args = Object.create(null) };\n' + `return \`${body}\``
  );
}

const Html = {
  escape,
  e: escape,
  escapeHtml,
  isVoidElement,
  attributesToString,
  toKebabCase,
  isUpper,
  styleToString,
  createElement,
  h: createElement,
  contentsToString,
  compile,
  Fragment
};

/**
 * These export configurations enable JS and TS developers to consumer @kitajs/html in
 * whatever way best suits their needs. Some examples of supported import syntax
 * includes:
 *
 * - `const Html = require('@kitajs/html')`
 * - `const { Html } = require('@kitajs/html')`
 * - `import * as Fastify from '@kitajs/html'`
 * - `import { Html, TSC_definition } from '@kitajs/html'`
 * - `import Html from '@kitajs/html'`
 * - `import Html, { TSC_definition } from '@kitajs/html'`
 */
module.exports = Html;
module.exports.Html = Html;
module.exports.default = Html;
