// Allows any custom element (a tag name containing a dash, as required by the HTML spec)
// with any attribute, for web component libraries without their own Kita Html types.
// Missing something? Please submit a issue report or a PR:
// https://github.com/kitajs/html

declare namespace JSX {
  interface IntrinsicElements {
    [tag: `${string}-${string}`]: CustomElementTag
  }

  interface CustomElementTag extends HtmlTag {
    // `any` instead of `unknown` so explicitly declared custom elements, which are
    // interfaces without an index signature, stay assignable to this index type.
    [attribute: string]: any
  }
}
