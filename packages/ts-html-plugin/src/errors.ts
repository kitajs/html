function createError(code: number, message: string) {
  return {
    code,
    message:
      process.env.INTERNAL_DISABLE_URL_DOCS !== 'true'
        ? `${message}\nSee https://html.kitajs.org/TS${code}`
        : message
  }
}

// 88600 is the base code for all errors in this plugin.
// KITA in ASCII
// 75 * 105 * 116 * 97 = 88609500
// Simplify to 88600

export const Xss = createError(
  88601,
  `Content may introduce an XSS vulnerability and must be marked with the \`safe\` attribute.`
)

export const DoubleEscape = createError(
  88602,
  `The \`safe\` attribute causes this content to be escaped more than once.`
)

export const ComponentXss = createError(
  88603,
  `Content inside a Component must be escaped using escapeHtml().`
)

export const UnusedSafe = createError(
  88604,
  `The \`safe\` attribute is unused in this context.`
)
