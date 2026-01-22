/// <reference path="./jsx.ts" />
/// <reference path="./suspense.ts" />
/// <reference path="./error-boundary.ts" />

const ESCAPED_REGEX = /[<"'&]/;
const CAMEL_REGEX = /[a-z][A-Z]/;

/**
 * Returns true if the character at the given index is an uppercase character.
 *
 * @param input The string to check.
 * @param index The index of the character to check.
 * @returns If the character at the given index is an uppercase character.
 */
export function isUpper(this: void, input: string, index: number): boolean {
  const code = input.charCodeAt(index);
  return code >= 65 /* A */ && code <= 90; /* Z */
}

/**
 * Converts a camel cased string to a kebab cased string.
 *
 * @param camel The camel cased string to convert.
 */
export function toKebabCase(this: void, camel: string): string {
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

/**
 * Tag function that escapes the given string pieces and interpolates the given values.
 * Internally it uses {@linkcode escapeHtml} to escape the values.
 *
 * @param strings Template string.
 * @param values Values to interpolate.
 * @returns The escaped string.
 */
export function escape(
  this: void,
  strings: TemplateStringsArray,
  ...values: any[]
): string {
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

/**
 * Escapes a string for safe use as HTML text content. If the value is not a string, it is
 * coerced to one with its own `toString()` method.
 *
 * If the {@linkcode Bun} runtime is available, this function will be swapped out to
 * {@linkcode Bun.escapeHTML}.
 *
 * @param value The value to escape.
 * @returns The escaped string.
 */
export let escapeHtml: (this: void, value: any) => string = function (value) {
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

/**
 * Returns true if the element is a html void element.
 *
 * @param tag The name of the element to check.
 * @returns If the element is a html void element.
 */
export function isVoidElement(this: void, tag: string): boolean {
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

/**
 * Transforms an object of style attributes into a html style string.
 *
 * @param style A record of literal values to use as style attributes or a string.
 * @returns The generated html style string.
 */
export function styleToString(this: void, style: object | string): string {
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

/**
 * Transforms an object of attributes into a html attributes string.
 *
 * **This function does not support Date objects.**
 *
 * @example `a b="c" d="1"`
 *
 * @param attributes A record of literal values to use as attributes.
 * @returns The generated html attributes string.
 */
export function attributesToString(this: void, attributes: object): string {
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

    if (value === null || value === undefined) {
      continue;
    }

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

export type Children =
  | number
  | string
  | boolean
  | null
  | undefined
  | bigint
  | Promise<Children>
  | Children[];

export type PropsWithChildren<T = {}> = { children?: Children } & T;

export type Component<T = {}> = (this: void, props: PropsWithChildren<T>) => JSX.Element;

/**
 * Joins raw string html elements into a single html string.
 *
 * A raw html fragment is just an array of strings, this method concatenates .
 *
 * @param contents An maybe nested array of strings to concatenate.
 * @param escape If it should escape the contents before concatenating them. Default is
 *   `false`
 * @returns The concatenated and escaped string of contents.
 */
export function contentsToString(
  this: void,
  contents: Children[],
  escape?: boolean
): JSX.Element {
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
 * Transforms a single content into a string.
 *
 * @param content The content to transform.
 * @param escape If it should escape the content before transforming it. Default is
 *   `false`
 * @returns The transformed and escaped string of content.
 */
export function contentToString(
  this: void,
  content: Children,
  escape?: boolean
): JSX.Element {
  switch (typeof content) {
    case 'string':
      return escape ? escapeHtml(content) : content;
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
    return contentsToString(content, escape);
  }

  if (typeof content.then === 'function') {
    return content.then(function resolveContent(resolved) {
      return contentToString(resolved, escape);
    });
  }

  throw new Error('Objects are not valid as a KitaJSX child');
}

/**
 * Generates a html string from the given contents.
 *
 * @param name The name of the element to create or a function that creates the element.
 * @param [attributes] A record of literal values to use as attributes. A property named
 *   `children` will be used as the children of the element.
 * @param children The inner contents of the element.
 * @returns The generated html string.
 */
export function createElement(
  this: void,
  name: string | Function,
  attributes: PropsWithChildren<any> | null,
  ...children: Children[]
): JSX.Element {
  const hasAttrs = attributes !== null;

  // Calls the element creator function if the name is a function
  if (typeof name === 'function') {
    // We at least need to pass the children to the function component. We may receive null if this
    // component was called without any children.
    if (!hasAttrs) {
      return name({ children: children.length > 1 ? children : children[0] });
    }

    attributes.children = children.length > 1 ? children : children[0];
    return name(attributes);
  }

  // Switches the tag name when this custom `tag` is present.
  if (hasAttrs && name === 'tag') {
    name = attributes.of as string;
  }

  const attrs = hasAttrs ? attributesToString(attributes) : '';

  if (children.length === 0) {
    return isVoidElement(name as string)
      ? '<' + name + attrs + '/>'
      : '<' + name + attrs + '></' + name + '>';
  }

  const contentsStr = contentsToString(children, hasAttrs && attributes.safe);

  if (typeof contentsStr === 'string') {
    return '<' + name + attrs + '>' + contentsStr + '</' + name + '>';
  }

  return contentsStr.then(function resolveContents(contents) {
    return '<' + name + attrs + '>' + contents + '</' + name + '>';
  });
}

/**
 * A JSX Fragment is used to return multiple elements from a component.
 *
 * @example
 *
 * ```tsx
 * // renders <div>1</div> and <div>2</div> without needing a wrapper element
 * const html = <><div>1</div><div>2</div></>
 *
 * // Html.Fragment is the same as <>...</>
 * const html = <Html.Fragment><div>1</div><div>2</div></Html.Fragment>
 * ```
 */
export function Fragment(props: PropsWithChildren): JSX.Element {
  return contentsToString([props.children]);
}

/** Here for interop with `preact` and many build systems. */
export const h: typeof createElement = createElement;

/**
 * Alias of {@linkcode escape} to reduce verbosity.
 *
 * @example
 *
 * ```tsx
 * import { e } from '@kitajs/html'
 *
 * <div>{e`My name is ${user.name}!`}</div>;
 * ```
 */
export const e: typeof escape = escape;

/**
 * Fast and type safe HTML templates using JSX syntax.
 *
 * @module Html
 * @license Apache License Version 2.0
 * @link https://github.com/kitajs/html
 * @link https://www.npmjs.com/package/@kitajs/html
 */
export const Html: Omit<typeof import('./index.js'), 'Html'> = {
  escape,
  e,
  escapeHtml,
  isVoidElement,
  attributesToString,
  toKebabCase,
  isUpper,
  styleToString,
  createElement,
  h,
  contentsToString,
  contentToString,
  Fragment
};
