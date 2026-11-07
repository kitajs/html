// Shape of `kita-html check --format json`. The published JSON Schema
// (`@kitajs/html-cli/check-report.schema.json`) is generated from these types at build time
// by ts-json-schema-generator, so JSDoc tags here become schema keywords.

/**
 * Report printed by `kita-html check --format json`.
 *
 * @title kita-html check report
 */
export interface JsonReport {
  /** The CLI that produced the report. */
  tool: JsonTool
  /** Version of the TypeScript package that ran the check. */
  typescript: string
  /** Checked tsconfig files, relative to the working directory, with forward slashes. */
  projects: string[]
  /** Counts for the whole run. */
  summary: JsonSummary
  /** Findings, sorted by file and position. */
  diagnostics: JsonDiagnostic[]
}

export interface JsonTool {
  name: '@kitajs/html-cli'
  version: string
}

export interface JsonSummary {
  /**
   * TSX/JSX files that were analyzed.
   *
   * @asType integer
   * @minimum 0
   */
  filesChecked: number
  /**
   * TS88601, TS88602 and TS88603 findings.
   *
   * @asType integer
   * @minimum 0
   */
  errors: number
  /**
   * TS88604 findings.
   *
   * @asType integer
   * @minimum 0
   */
  warnings: number
}

export interface JsonDiagnostic {
  /** Path relative to the working directory, with forward slashes. */
  file: string
  /**
   * Diagnostic code, from 88601 to 88604.
   *
   * @asType integer
   */
  code: number
  /**
   * The code in its `TS88601` form.
   *
   * @pattern ^TS\d+$
   */
  id: string
  /** TS88604 is a warning; every other code is an error. */
  severity: 'error' | 'warning'
  /** Diagnostic text. */
  message: string
  /** Documentation page for the code. */
  url: string
  start: JsonLocation
  end: JsonLocation
}

export interface JsonLocation {
  /**
   * 1-based line.
   *
   * @asType integer
   * @minimum 1
   */
  line: number
  /**
   * 1-based column in UTF-16 code units.
   *
   * @asType integer
   * @minimum 1
   */
  column: number
  /**
   * 0-based UTF-16 offset in the file.
   *
   * @asType integer
   * @minimum 0
   */
  offset: number
}
