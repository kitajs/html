---
description:
  Reference for kita-html check output formats (pretty, tsc, json, github), the JSON
  report fields, flags, and exit codes.
---

# Output formats

`kita-html check` writes its report to stdout. Usage and configuration errors, and
warnings about skipped files, go to stderr. Select a format with `--format` (`-f`).

| Format   | Output                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pretty` | Default. Code frames, documentation links, and a summary line. Inside GitHub Actions without `--format`, annotations are printed first.                            |
| `tsc`    | One `file(line,col): error TS88601: message` line per finding, identical to `tsc` output. Prints nothing when clean.                                               |
| `json`   | One JSON document, also printed when clean. Follows the schema shipped at `@kitajs/html-cli/schema/check-report.v1.json`.                                          |
| `github` | One GitHub Actions `::error` or `::warning` annotation per finding, followed by one `file:line:col: error TS88601: message` line per finding and the summary line. |

`--color` and `--no-color` force colors on or off for `pretty`. Without them, a non-empty
`NO_COLOR` disables colors, and `FORCE_COLOR` enables them unless it is `0` or `false`.
Otherwise colors are on in GitHub Actions and when stdout is a terminal. Other formats
never print colors.

## Flags

| Flag                   | Description                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| `-p, --project <path>` | `tsconfig.json` file or directory. Repeatable. Defaults to the current directory.                |
| `-f, --format <name>`  | `pretty`, `tsc`, `json`, or `github`. Defaults to `pretty` (plus annotations in GitHub Actions). |
| `--[no-]color`         | Forces colors on or off for `pretty`.                                                            |
| `[files...]`           | Restricts the report to these TSX or JSX files. Types still come from the project.               |

## JSON report

| Field                        | Type                                 | Description                                                       |
| ---------------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| `version`                    | `1`                                  | Schema version. Changes only on breaking changes.                 |
| `tool`                       | `{ name, version }`                  | `@kitajs/html-cli` and its version.                               |
| `typescript`                 | `string`                             | Version of the TypeScript package that ran the check.             |
| `projects`                   | `string[]`                           | Checked `tsconfig.json` files, relative to the working directory. |
| `summary`                    | `{ filesChecked, errors, warnings }` | Counts for the whole run.                                         |
| `diagnostics[].file`         | `string`                             | Path relative to the working directory, with forward slashes.     |
| `diagnostics[].code`         | `number`                             | `88601` to `88604`. `id` holds the `TS88601` form.                |
| `diagnostics[].severity`     | `"error" \| "warning"`               | TS88604 is a warning. Every other code is an error.               |
| `diagnostics[].message`      | `string`                             | Diagnostic text. `url` links to its documentation.                |
| `diagnostics[].start`, `end` | `{ line, column, offset }`           | 1-based line and column in UTF-16 code units, 0-based offset.     |

Diagnostics are sorted by file and position.

## Exit codes

| Code  | Meaning                                                                            |
| ----- | ---------------------------------------------------------------------------------- |
| `0`   | No findings.                                                                       |
| `1`   | At least one error (TS88601, TS88602, TS88603), or invalid flags or configuration. |
| `2`   | Only warnings (TS88604).                                                           |
| `127` | Unknown command.                                                                   |
