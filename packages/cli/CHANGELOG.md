# @kitajs/html-cli

## 5.0.0-next.0

### Major Changes

- Add the `kita-html` CLI. `kita-html check` finds XSS vulnerabilities in TSX and JSX
  files on TypeScript 7.1+ and reports them in the pretty, tsc, json or github format. The
  json format follows the JSON Schema exported at
  `@kitajs/html-cli/check-report.schema.json`, generated from the report types at build
  time.

### Minor Changes

- `--format` accepts several formats, comma separated or repeated (`-f pretty,github`),
  and defaults to `pretty,github` inside GitHub Actions, so findings are annotated on pull
  requests without extra configuration. The `github` format now prints only the
  annotations

### Patch Changes

- Fix `safe` attribute checks and Windows startup:
  - Treat `safe={true}` like a bare `safe` attribute.
  - Stop reporting TS88604 when another child of the element still needs escaping, as in
    `<p safe>{name}{count}</p>`.
  - Report TS88602 instead of TS88604 when a `safe` element both double escapes and has
    safe children.
  - Skip oclif's shell detection on Windows, which spawned PowerShell on every run and
    took seconds before the check started.
  - Treat an empty `FORCE_COLOR` as forcing colors and `FORCE_COLOR=0` or `false` as
    turning them off, as Node.js does.
