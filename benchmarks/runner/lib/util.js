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
