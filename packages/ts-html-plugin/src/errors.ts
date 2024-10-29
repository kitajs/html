function urlDocs(error: `k${number}`) {
  return `https://html.kitajs.org/packages/ts-html-plugin#${error}`;
}

export const Xss = {
  code: '0 K601' as any,
  message: `Usage of xss-prone content without \`safe\` attribute. ${urlDocs('k601')}`
};

export const DoubleEscape = {
  code: '0 K602' as any,
  message: `Double escaping detected. Please remove the \`safe\` attribute. ${urlDocs('k602')}`
};

export const ComponentXss = {
  code: '0 K603' as any,
  message: `Xss-prone content inside a Component, wrap it into a Html.escapeHtml() call. ${urlDocs('k603')}`
};

export const UnusedSafe = {
  code: '0 K604' as any,
  message: `Unused safe attribute. ${urlDocs('k604')}`
};
