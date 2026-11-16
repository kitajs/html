// Same codes and messages as @kitajs/ts-html-plugin. The documentation URL is kept apart
// from the message so single-line formats (tsc, github) stay on one line.

export interface KitaError {
  code: number
  message: string
}

export const Xss: KitaError = {
  code: 88601,
  message:
    'Content may introduce an XSS vulnerability and must be marked with the `safe` attribute.'
}

export const DoubleEscape: KitaError = {
  code: 88602,
  message: 'The `safe` attribute causes this content to be escaped more than once.'
}

export const ComponentXss: KitaError = {
  code: 88603,
  message: 'Content inside a Component must be escaped using escapeHtml().'
}

export const UnusedSafe: KitaError = {
  code: 88604,
  message: 'The `safe` attribute is unused in this context.'
}

export function docsUrl(code: number): string {
  return `https://html.kitajs.org/TS${code}`
}
