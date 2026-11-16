import './jsx.js'

/// <reference path="./suspense.ts" />
/// <reference path="./error-boundary.ts" />

import {
  attributePrefix,
  escapeQuotes,
  isThenable,
  isVoidElement,
  joinClasses,
  styleProperty,
  tagParts,
  type TagParts
} from './helpers.js'

export { isVoidElement }

const ESCAPED_REGEX = /[<"'&]/

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
    valuesLength = values.length

  let index = 0,
    result = ''

  for (; index < stringsLength; index++) {
    result += strings[index]

    if (index < valuesLength) {
      result += values[index]
    }
  }

  // Escape the entire string at once.
  // This is faster than escaping each piece individually.
  return escapeHtml(result)
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
export let escapeHtml: (this: void, value: any) => string = (value) => {
  if (typeof value !== 'string') {
    value = value.toString()
  }

  // This is a optimization to avoid the whole conversion process when the
  // string does not contain any uppercase characters.
  if (!ESCAPED_REGEX.test(value)) {
    return value
  }

  const length = value.length

  let escaped = '',
    start = 0,
    end = 0

  // Escapes double quotes to be used inside attributes
  // Faster than using regex
  // https://jsperf.app/kakihu
  for (; end < length; end++) {
    // https://wonko.com/post/html-escaping
    switch (value[end]) {
      case '&':
        escaped += value.slice(start, end) + '&amp;'
        start = end + 1
        continue
      // We don't need to escape > because it is only used to close tags.
      // https://stackoverflow.com/a/9189067
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
    }
  }

  // Appends the remaining string.
  escaped += value.slice(start, end)

  return escaped
}

/* v8 ignore next 2 */
// @ts-ignore - bun runtime have its own escapeHTML function.
if (typeof Bun !== 'undefined') escapeHtml = Bun.escapeHTML

/**
 * Transforms an object of style attributes into a html style string.
 *
 * Keys are converted from camelCase to kebab-case, except custom properties (`--name`),
 * which are case sensitive and kept as written.
 *
 * @param style A record of literal values to use as style attributes or a string.
 * @returns The generated html style string.
 * @internal
 */
export function styleToString(this: void, style: object | string): string {
  // As we use the " character to wrap the style string, we need to escape it.
  if (typeof style === 'string') {
    return escapeQuotes(style)
  }

  let result = ''

  for (const key of Object.keys(style)) {
    // @ts-expect-error - this indexing is safe.
    const value = style[key]

    if (value === null || value === undefined) {
      continue
    }

    // Only needs escaping when the value is a string.
    result +=
      styleProperty(key) +
      ':' +
      (typeof value === 'string' ? escapeQuotes(value) : value.toString()) +
      ';'
  }

  return result
}

/**
 * Serializes a single attribute. `children`, `safe` and `of` must be handled by the
 * caller.
 *
 * @param key The attribute name.
 * @param value The attribute value.
 * @param attributes The object the attribute belongs to.
 */
function attributeToString(key: string, value: any, attributes: any): string {
  if (value === null || value === undefined) {
    return ''
  }

  // React className compatibility.
  if (key === 'className') {
    // Both were provided, so use the class attribute.
    if (attributes.class !== undefined) {
      return ''
    }

    key = 'class'
  } else if (key === 'class' && Array.isArray(value)) {
    value = joinClasses(value)

    // All classes may have been disabled.
    if (value.length === 0) {
      return ''
    }
  } else if (key === 'style') {
    return ' style="' + styleToString(value) + '"'
  } else if (key === 'attrs') {
    return typeof value === 'string' ? ' ' + value : attributesToString(value)
  }

  switch (typeof value) {
    case 'string':
      return attributePrefix(key) + escapeQuotes(value) + '"'

    case 'boolean':
      // Only add the attribute if the value is true.
      return value ? ' ' + key : ''

    case 'object':
      // Dates are always safe
      if (value instanceof Date) {
        return attributePrefix(key) + value.toISOString() + '"'
      }

      // The object may have a overridden toString method.
      // Which results in a non escaped string.
      return attributePrefix(key) + escapeQuotes(value.toString()) + '"'

    default:
      return attributePrefix(key) + value + '"'
  }
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
  let key,
    result = ''

  for (key in attributes) {
    // Skips all @kitajs/html specific attributes.
    if (key === 'children' || key === 'safe' || key === 'of') {
      continue
    }

    // @ts-expect-error - this indexing is safe.
    result += attributeToString(key, attributes[key], attributes)
  }

  return result
}

export type Children =
  | number
  | string
  | boolean
  | null
  | undefined
  | bigint
  | Promise<Children>
  | Children[]

export type PropsWithChildren<T = {}> = { children?: Children } & T

export type Component<T = {}> = (this: void, props: PropsWithChildren<T>) => JSX.Element

/**
 * Joins raw string html elements into a single html string.
 *
 * A raw html fragment is just an array of strings, this method concatenates them. The
 * given array is never modified.
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
  const length = contents.length

  let result = ''

  for (let index = 0; index < length; index++) {
    const content = contents[index]

    switch (typeof content) {
      case 'string':
      case 'number':
      // Bigint is the only case where it differs from React.
      // where React renders a empty string and we render the whole number.
      case 'bigint':
        result += content
        continue
      case 'boolean':
      case 'undefined':
        continue
    }

    if (content === null) {
      continue
    }

    if (Array.isArray(content)) {
      // Escaping happens once, over the whole result.
      const inner = contentsToString(content)

      if (typeof inner === 'string') {
        result += inner
        continue
      }

      return resolveContents(result, inner, contents, index + 1, escape)
    }

    if (typeof content.then === 'function') {
      return resolveContents(result, content, contents, index + 1, escape)
    }

    throw new Error('Objects are not valid as a KitaJSX child')
  }

  // escapeHtml is faster with longer strings, that's
  // why we escape the entire result once
  if (escape === true) {
    return escapeHtml(result)
  }

  return result
}

/**
 * Waits for the first pending content and everything after it, then joins the result.
 *
 * @param prefix The already joined contents before the pending one.
 * @param pending The first unresolved content.
 * @param contents The contents being joined.
 * @param from The index of the first content after `pending`.
 * @param escape If the final result should be escaped.
 */
function resolveContents(
  prefix: string,
  pending: Children,
  contents: Children[],
  from: number,
  escape: boolean | undefined
): Promise<string> {
  const rest: Children[] = [prefix, pending]

  for (let index = from; index < contents.length; index++) {
    rest.push(contents[index])
  }

  // @ts-expect-error - Type instantiation is excessively deep and possibly infinite.
  return Promise.all(rest).then(function resolveRest(resolved) {
    return contentsToString(resolved, escape)
  })
}

/**
 * Transforms a single content into a string.
 *
 * @param content The content to transform.
 * @param escape If it should escape the content before transforming it. Default is
 *   `false`
 * @returns The transformed and escaped string of content.
 * @internal
 */
export function contentToString(
  this: void,
  content: Children,
  escape?: boolean
): JSX.Element {
  switch (typeof content) {
    case 'string':
      return escape ? escapeHtml(content) : content
    case 'number':
    // Bigint is the only case where it differs from React.
    // where React renders a empty string and we render the whole number.
    case 'bigint':
      return content.toString()
    case 'boolean':
    case 'undefined':
      return ''
  }

  if (content === null) {
    return ''
  }

  if (Array.isArray(content)) {
    return contentsToString(content, escape)
  }

  if (typeof content.then === 'function') {
    // Promise.resolve returns native promises as is and converts other thenables, so
    // callers can rely on `typeof result === 'string'` to detect sync results.
    return Promise.resolve(content).then(function resolveContent(resolved) {
      return contentToString(resolved, escape)
    })
  }

  throw new Error('Objects are not valid as a KitaJSX child')
}

/**
 * Wraps rendered contents with the given tag.
 *
 * @param tag The tag to wrap the contents with.
 * @param attrs The serialized attributes.
 * @param contents The rendered contents.
 */
function wrapContents(tag: TagParts, attrs: string, contents: JSX.Element): JSX.Element {
  if (typeof contents === 'string') {
    return tag.open + attrs + '>' + contents + tag.close
  }

  return contents.then(function resolveContents(resolved) {
    return tag.open + attrs + '>' + resolved + tag.close
  })
}

/**
 * Renders an intrinsic element.
 *
 * @param name The tag name.
 * @param attrs The serialized attributes.
 * @param children The element children, `undefined` renders an empty element.
 * @param safe If the children should be escaped.
 */
function renderTag(
  name: string,
  attrs: string,
  children: Children,
  safe: boolean | undefined
): JSX.Element {
  const tag = tagParts(name)

  // Empty children only matter for void elements, others render the same either way.
  if (
    children === undefined ||
    (tag.void && Array.isArray(children) && children.length === 0)
  ) {
    if (tag.void) {
      return tag.open + attrs + '/>'
    }

    return tag.open + attrs + '>' + tag.close
  }

  // Async children are resolved once and wrapped in the same step, instead of chaining
  // one promise in contentToString and another one to wrap it.
  if (isThenable(children)) {
    return Promise.resolve(children).then(function resolveChildren(resolved) {
      return wrapContents(tag, attrs, contentToString(resolved, safe))
    })
  }

  return wrapContents(tag, attrs, contentToString(children, safe))
}

/**
 * Renders an intrinsic element from its JSX props.
 *
 * Reads `children`, `safe` and `of` in the same pass that serializes the attributes,
 * instead of looking them up separately on every props object shape.
 *
 * @param name The tag name.
 * @param attributes The element props.
 * @internal
 */
export function renderElement(
  this: void,
  name: string,
  attributes: PropsWithChildren<any>
): JSX.Element {
  // Switches the tag name when this custom `tag` is present.
  if (name === 'tag') {
    name = attributes.of
  }

  let key,
    children,
    safe,
    attrs = ''

  // Keyed access with the for-in key uses V8's enum cache, named access (`.children`)
  // would be a megamorphic lookup as every element has a different props shape.
  for (key in attributes) {
    if (key === 'children') {
      children = attributes[key]
      continue
    }

    if (key === 'safe') {
      safe = attributes[key]
      continue
    }

    if (key === 'of') {
      continue
    }

    attrs += attributeToString(key, attributes[key], attributes)
  }

  return renderTag(name, attrs, children, safe)
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
  const hasAttrs = attributes !== null

  // Calls the element creator function if the name is a function
  if (typeof name === 'function') {
    // We at least need to pass the children to the function component. We may receive null if this
    // component was called without any children.
    if (!hasAttrs) {
      return name({ children: children.length > 1 ? children : children[0] })
    }

    attributes.children = children.length > 1 ? children : children[0]
    return name(attributes)
  }

  // Switches the tag name when this custom `tag` is present.
  if (hasAttrs && name === 'tag') {
    name = attributes.of as string
  }

  return renderTag(
    name,
    hasAttrs ? attributesToString(attributes) : '',
    children.length === 0 ? undefined : children,
    hasAttrs && attributes.safe === true
  )
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
export function Fragment(
  props: PropsWithChildren<Pick<JSX.HtmlTag, 'safe'>>
): JSX.Element {
  return contentToString(props.children, props.safe)
}

/** @deprecated Here for interop with `preact` and many build systems. */
export const h: typeof createElement = createElement

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
export const e: typeof escape = escape

/**
 * Namespace export containing all core runtime functions. Used with the legacy `jsx:
 * "react"` transform where `jsxFactory` is set to `Html.createElement`. When using the
 * modern `jsx: "react-jsx"` transform, import individual functions directly from
 * `@kitajs/html` instead.
 *
 * @deprecated This namespace export is only provided for interop with the legacy `jsx:
 *   "react"`.
 * @see https://github.com/kitajs/html
 * @see https://www.npmjs.com/package/@kitajs/html
 */
export const Html: Omit<
  typeof import('./index.js'),
  'Html' | 'default' | 'renderElement'
> = {
  escape,
  e,
  escapeHtml,
  isVoidElement,
  attributesToString,
  styleToString,
  createElement,
  h,
  contentsToString,
  contentToString,
  Fragment
}
