/// <reference path="./jsx.d.ts" />
/// <reference types="./suspense.d.ts" />
/// <reference types="./error-boundary.d.ts" />

/**
 * Returns true if the character at the given index is an uppercase character.
 *
 * @param {string} input The string to check.
 * @param {number} index The index of the character to check.
 * @returns {boolean} If the character at the given index is an uppercase character.
 * @this {void}
 */
export function isUpper(this: void, input: string, index: number): boolean;

/**
 * Tag function that escapes the given string pieces and interpolates the given values.
 * Internally it uses {@linkcode escapeHtml} to escape the values.
 *
 * @param {TemplateStringsArray} strings Template string.
 * @param {...any} values Values to interpolate.
 * @returns {string} The escaped string.
 * @this {void}
 */
export function escape(
  this: void,
  strings: TemplateStringsArray,
  ...values: any[]
): string;

/**
 * Escapes a string for safe use as HTML text content. If the value is not a string, it is
 * coerced to one with its own `toString()` method.
 *
 * If the {@linkcode Bun} runtime is available, this function will be swapped out to
 * {@linkcode Bun.escapeHTML}.
 *
 * @param {unknown} value The value to escape.
 * @returns {string} The escaped string.
 * @this {void}
 */
export function escapeHtml(this: void, value: any): string;

/**
 * Returns true if the element is a html void element.
 *
 * @param {string} tag The name of the element to check.
 * @returns {boolean} If the element is a html void element.
 * @this {void}
 */
export function isVoidElement(this: void, tag: string): boolean;

/**
 * Transforms an object of style attributes into a html style string.
 *
 * @param {object | string} style A record of literal values to use as style attributes or
 *   a string.
 * @returns {string} The generated html style string.
 * @this {void}
 */
export function styleToString(this: void, style: object | string): string;

/**
 * Transforms an object of attributes into a html attributes string.
 *
 * **This function does not support Date objects.**
 *
 * @example `a b="c" d="1"`
 *
 * @param {object} attributes A record of literal values to use as attributes.
 * @returns {string} The generated html attributes string.
 * @this {void}
 */
export function attributesToString(this: void, attributes: object): string;

/**
 * Converts a camel cased string to a kebab cased string.
 *
 * @param {string} camel The camel cased string to convert.
 * @this {void}
 */
export function toKebabCase(this: void, camel: string): string;

/**
 * Generates a html string from the given contents.
 *
 * @param {string | Function} name The name of the element to create or a function that
 *   creates the element.
 * @param {{ children?: object }} [attributes] A record of literal values to use as
 *   attributes. A property named `children` will be used as the children of the element.
 * @param {...string} contents The inner contents of the element.
 * @returns {string} The generated html string.
 * @this {void}
 */
export function createElement<C extends Children[], N extends string | Function>(
  this: void,
  name: N,
  attributes: PropsWithChildren<any> | null,
  ...contents: C
): Promise<string> extends C[number]
  ? Promise<string>
  : N extends () => Promise<string>
    ? Promise<string>
    : string;

/**
 * Joins raw string html elements into a single html string.
 *
 * A raw html fragment is just an array of strings, this method concatenates .
 *
 * @param {import('.').Children[]} contents An maybe nested array of strings to
 *   concatenate.
 * @param {boolean} [escape=false] If we should escape the contents before concatenating
 *   them. Default is `false`
 * @returns {string} The concatenated and escaped string of contents.
 * @this {void}
 */
export function contentsToString<C extends Children[]>(
  this: void,
  contents: C,
  escape?: boolean
): Promise<string> extends C[number] ? Promise<string> : string;

/**
 * Compiles a **clean component** into a super fast component. This does not support
 * unclean components / props processing.
 *
 * A **clean component** is a component that does not process props before applying them
 * to the element. This means that the props are applied to the element as is, and you
 * need to process them before passing them to the component.
 *
 * @example
 *
 * ```tsx
 * // Clean component, render as is
 * function Clean(props: PropsWithChildren<{ repeated: string }>) { return <div>{props.repeated}</div> }
 *
 * // Calculation is done before passing to the component
 * html = <Clean name={'a'.repeat(5)} />
 *
 * // Unclean component, process before render
 * function Unclean(props: { repeat: string; n: number }) { return <div>{props.repeat.repeat(props.n)}</div> }
 *
 * // Calculation is done inside the component, thus cannot be used with .compile() html =
 * <Unclean repeat="a" n={5} />
 * ```
 *
 * @param {Function} htmlComponent The _clean_ component to compile. @param {boolean}
 *   [strict=true] If we should throw an error when a property is not found. Default is
 *   `true`
 * @param {string | undefined} [separator] The string used to interpolate and separate
 *   parameters @returns {Function} The compiled template function @this {void}
 */
export function compile<
  P extends { [K in keyof P]: K extends 'children' ? Children : string }
>(
  this: void,
  cleanComponent: Component<P>,
  strict?: boolean,
  separator?: string
): Component<P>;

/** Here for interop with `preact` and many build systems. */
export const h: typeof createElement;

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
export const e: typeof escape;

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
export function Fragment(props: PropsWithChildren): JSX.Element;

export type Children =
  | number
  | string
  | boolean
  | null
  | undefined
  | Promise<Children>
  | Children[];

export type PropsWithChildren<T = {}> = { children?: Children } & T;

export type Component<T = {}> = (this: void, props: PropsWithChildren<T>) => JSX.Element;

/**
 * Fast and type safe HTML templates using JSX syntax.
 *
 * @module Html
 * @license Apache License Version 2.0
 * @link https://github.com/kitajs/html
 * @link https://www.npmjs.com/package/@kitajs/html
 */
export const Html: Omit<typeof import('.'), 'Html'>;

/**
 * Fast and type safe HTML templates using JSX syntax.
 *
 * @module Html
 * @license Apache License Version 2.0
 * @link https://github.com/kitajs/html
 * @link https://www.npmjs.com/package/@kitajs/html
 */
export as namespace Html;
