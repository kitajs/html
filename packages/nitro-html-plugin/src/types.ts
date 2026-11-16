import type { H3Event } from 'nitro'

/**
 * A convention page rendered by `@kitajs/nitro-html-plugin`.
 *
 * The event exposes route parameters, request data, context populated by middleware, and
 * prepared response status and headers.
 */
export type NitroHtmlPage = (event: H3Event) => JSX.Element

/** Build-time metadata derived from one file in the configured pages directory. */
export interface ScannedPage {
  /** Absolute source file path imported by the generated virtual module. */
  file: string

  /** Normalized source path relative to the pages directory. */
  relativePath: string

  /** Nitro route pattern generated from the relative path. */
  route: string

  /** Parameter-name-independent route used for collision detection. */
  canonicalRoute: string

  /** Whether this root catch-all page becomes Nitro's renderer. */
  renderer: boolean
}
