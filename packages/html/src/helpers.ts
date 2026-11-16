import type { Children } from './index.js'

const CAMEL_REGEX = /[a-z][A-Z]/

/**
 * Returns true if the character at the given index is an uppercase character.
 *
 * @param input The string to check.
 * @param index The index of the character to check.
 * @returns If the character at the given index is an uppercase character.
 */
function isUpper(input: string, index: number): boolean {
  const code = input.charCodeAt(index)
  return code >= 65 /* A */ && code <= 90 /* Z */
}

/**
 * Converts a camel cased string to a kebab cased string.
 *
 * @param camel The camel cased string to convert.
 */
function toKebabCase(camel: string): string {
  // This is a optimization to avoid the whole conversion process when the
  // string does not contain any uppercase characters.
  if (!CAMEL_REGEX.test(camel)) {
    return camel
  }

  const length = camel.length

  let start = 0,
    end = 0,
    // csstype writes the ms vendor prefix in lowercase (`msTransform`).
    kebab = camel.startsWith('ms') && isUpper(camel, 2) ? '-' : '',
    // A capitalized first word is a vendor prefix (`WebkitTransition`) and needs a
    // leading hyphen, a fully uppercase one is an abbreviation and is kept as is.
    prev = !isUpper(camel, 0) || isUpper(camel, 1),
    curr = isUpper(camel, 0),
    next

  for (; end < length; end++) {
    next = isUpper(camel, end + 1)

    // detects the start of a new camel case word and avoid lowercasing abbreviations.
    if (!prev && curr && !next) {
      kebab += camel.slice(start, end) + '-' + camel[end]!.toLowerCase()
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
  )
}

/**
 * Maximum number of entries of each name cache.
 *
 * Names usually come from source code, so a page only ever sees a few hundred of them.
 * Names built at runtime (`<tag of={name}>`, computed attribute keys) could grow a cache
 * forever, so after this limit new names are still computed but no longer stored.
 */
const CACHE_LIMIT = 1024

/** The strings needed to render a tag, computed once per tag name. */
export type TagParts = {
  /** `<name`, followed by the attributes and `>` or `/>`. */
  open: string
  /** `</name>`. */
  close: string
  /** If the tag is a void element and must be rendered as `<name/>`. */
  void: boolean
}

/**
 * Tag name to its {@linkcode TagParts}.
 *
 * Every string concatenation allocates a new string and adds a node V8 has to walk when
 * the final html is flattened. Caching `<name` and `</name>` saves two concatenations per
 * element, and storing `void` skips the {@linkcode isVoidElement} comparisons. One object
 * per tag measured faster than one map per string, as it needs a single lookup.
 */
const TAG_CACHE = new Map<string, TagParts>()

/**
 * Attribute name to ` name="`.
 *
 * Saves two concatenations per attribute. See {@linkcode TAG_CACHE}.
 */
const ATTRIBUTE_CACHE = new Map<string, string>()

/**
 * Style object key to its css property name.
 *
 * Converting camelCase to kebab-case on every render costs ~100ns per property, which
 * made style objects 2-4x slower than style strings.
 */
const STYLE_CACHE = new Map<string, string>()

/**
 * Returns the cached {@linkcode TagParts} of a tag name.
 *
 * @param name The tag name.
 */
export function tagParts(name: string): TagParts {
  let parts = TAG_CACHE.get(name)

  if (parts === undefined) {
    parts = {
      open: '<' + name,
      close: '</' + name + '>',
      void: isVoidElement(name)
    }

    if (TAG_CACHE.size < CACHE_LIMIT) {
      TAG_CACHE.set(name, parts)
    }
  }

  return parts
}

/**
 * Returns the cached ` key="` prefix of an attribute.
 *
 * @param key The attribute name.
 */
export function attributePrefix(key: string): string {
  let prefix = ATTRIBUTE_CACHE.get(key)

  if (prefix === undefined) {
    prefix = ' ' + key + '="'

    if (ATTRIBUTE_CACHE.size < CACHE_LIMIT) {
      ATTRIBUTE_CACHE.set(key, prefix)
    }
  }

  return prefix
}

/**
 * Returns the cached css property name of a style object key.
 *
 * @param key The style object key.
 */
export function styleProperty(key: string): string {
  let property = STYLE_CACHE.get(key)

  if (property === undefined) {
    // Custom properties are case sensitive and must be kept as written.
    property = key.startsWith('--') ? key : toKebabCase(key)

    if (STYLE_CACHE.size < CACHE_LIMIT) {
      STYLE_CACHE.set(key, property)
    }
  }

  return property
}

/**
 * Returns true for promises and any other object with a `then` method.
 *
 * @param value The value to check.
 */
export function isThenable(value: unknown): value is PromiseLike<Children> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  )
}

/**
 * Escapes the `"` character, the only one that can end a double quoted attribute value.
 * Faster than using regex: https://jsperf.app/kakihu
 *
 * @param value The attribute value.
 */
export function escapeQuotes(value: string): string {
  let end = value.indexOf('"')

  if (end === -1) {
    return value
  }

  const length = value.length

  let escaped = '',
    start = 0

  for (; end < length; end++) {
    if (value.charCodeAt(end) === 34 /* " */) {
      escaped += value.slice(start, end) + '&#34;'
      start = end + 1
    }
  }

  return escaped + value.slice(start, end)
}

/**
 * Joins the truthy items of a `class` array with a space.
 *
 * @param items The class names to join.
 */
export function joinClasses(items: any[]): string {
  const length = items.length

  let result = ''

  for (let i = 0; i < length; i++) {
    if (items[i] && items[i].length > 0) {
      if (result) {
        result += ' ' + items[i].trim()
      } else {
        result += items[i].trim()
      }
    }
  }

  return result
}
