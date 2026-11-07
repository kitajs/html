---
'@kitajs/html-cli': major
---

Add the `kita-html` CLI. `kita-html check` finds XSS vulnerabilities in TSX and JSX files
on TypeScript 7.1+ and reports them in the pretty, tsc, json or github format. The json
format follows the JSON Schema exported at `@kitajs/html-cli/check-report.schema.json`,
generated from the report types at build time.
