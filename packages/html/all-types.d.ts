// This file extends JSX namespace to allow any tag/attribute combination.
// Having problems? Please submit a issue report or a PR:
// https://github.com/kitajs/html

declare namespace JSX {
  interface HtmlTag {
    [name: string]: unknown;
  }

  interface IntrinsicElements {
    [name: string]: HtmlTag;
  }
}
