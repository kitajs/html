import htmlMinifier from 'html-minifier';
import prettier from 'prettier';

/** @param {string} code */
export function format(code) {
  return (
    prettier
      // minifies and format to ensure consistency
      .format(code, {
        parser: 'html',
        arrowParens: 'always',
        bracketSpacing: true,
        endOfLine: 'lf',
        insertPragma: false,
        bracketSameLine: false,
        jsxSingleQuote: false,
        printWidth: 90,
        proseWrap: 'always',
        quoteProps: 'as-needed',
        requirePragma: false,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'none',
        useTabs: false,
        vueIndentScriptAndStyle: false,
        tsdoc: true
      })
  );
}

/** @param {string} code */
export function minify(code) {
  return htmlMinifier.minify(code, {
    collapseWhitespace: true,
    removeComments: false,
    html5: true
  });
}

export function generatePurchases(amount = 1000) {
  return Array.from({ length: amount }, (_, i) => ({
    name: `Purchase number ${i + 1}`,
    price: i * 2,
    quantity: i * 5
  }));
}

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use binary (IEC),
 *   aka powers of 1024.
 * @param dp Number of decimal places to display.
 * @returns Formatted string.
 */
export function humanFileSize(bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return `${bytes.toFixed(dp)} ${units[u]}`;
}
