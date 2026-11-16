import prettier from 'prettier'

/** @param {string} code */
export function format(code) {
  return prettier.format(code, {
    parser: 'html',
    endOfLine: 'lf',
    printWidth: 90,
    proseWrap: 'always',
    singleQuote: true,
    tabWidth: 2,
    useTabs: false
  })
}

// Names contain html special characters so every runner exercises its escaping path.
export const BENCH_NAME = `Bench & "co" <mark> 'it'`

export function generatePurchases(amount = 1000) {
  return Array.from({ length: amount }, (_, i) => ({
    name: `Purchase "${i + 1}" & <co> 'ltd'`,
    price: i * 2,
    quantity: i * 5
  }))
}

const ENTITIES = {
  '&#38;': '&amp;',
  '&#x26;': '&amp;',
  '&#60;': '&lt;',
  '&#x3c;': '&lt;',
  '&gt;': '>',
  '&#62;': '>',
  '&#x3e;': '>',
  '&quot;': '"',
  '&#34;': '"',
  '&#x22;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#x27;': "'"
}

/**
 * Libraries pick different, equally valid, encodings for the same characters (`&#39;` vs
 * `&#x27;`) and some do not escape characters that are safe in text content (`>`). This
 * maps every variant to one form so outputs can be compared. `&` and `<` stay escaped, a
 * runner that leaves them raw still fails the comparison.
 *
 * @param {string} html
 */
export function normalizeEntities(html) {
  return html.replace(
    /&(?:#38|#x26|#60|#x3c|gt|#62|#x3e|quot|#34|#x22|apos|#39|#x27);/gi,
    (e) => ENTITIES[e.toLowerCase()]
  )
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
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return `${bytes.toFixed(dp)} ${units[u]}`
}
