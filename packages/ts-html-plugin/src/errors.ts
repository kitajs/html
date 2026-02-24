const USE_URL_DOCS = process.env.INTERNAL_DISABLE_URL_DOCS !== 'true';

function createError(code: number, message: string) {
  // KITA in ASCII
  // 75 * 105 * 116 * 97 = 88609500
  // Simplify to 88600
  code += 88600;

  return {
    code,
    message: USE_URL_DOCS ? `${message}\nhttps://html.kitajs.org/k${code}` : message
  };
}

export const Xss = createError(
  1,
  `Usage of xss-prone content without \`safe\` attribute.`
);

export const DoubleEscape = createError(
  2,
  `Double escaping detected. Please remove the \`safe\` attribute.`
);

export const ComponentXss = createError(
  3,
  `Xss-prone content inside a Component, wrap it into a Html.escapeHtml() call.`
);

export const UnusedSafe = createError(4, `Unused safe attribute.`);
