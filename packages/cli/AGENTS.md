# @kitajs/html-cli - Developer Guide

## Overview

`@kitajs/html-cli` ships the `kita-html` command. Its `check` command finds XSS
vulnerabilities in Kita Html JSX on TypeScript 7.1+, through the IPC API in
`typescript/sync`. It replaces the deprecated `@kitajs/ts-html-plugin`, which needs the
TypeScript 6 compiler API and language service plugins that TypeScript 7 removed.

## File structure

```
bin/kita-html.js         oclif entry
schema/                  JSON Schema of the json report, exported as a package subpath
src/
  cli/                   Everything oclif-specific
    commands/check.ts    `kita-html check` (flags, exit codes, error mapping)
    color.ts             --color / NO_COLOR / FORCE_COLOR / TTY resolution
  check.ts               check(options): opens projects, expands references, runs the analyzer
  typescript.ts          Loads typescript/sync, ast and ast/is from the project. Version gate
  analyzer/              Port of ts-html-plugin's util.ts to the TypeScript 7.1 API
  reporters/             pretty, tsc, json and github formatters
  diagnostic.ts          KitaDiagnostic, sorting, dedupe, exit codes
  errors.ts              TS88601 to TS88604 (message and docs URL kept apart)
  paths.ts               Windows-safe path normalization
test/
  analyzer/              Rule tests ported from ts-html-plugin (same fixtures and positions)
  util/project.ts        In-memory projects served through the API filesystem callbacks
  check.test.ts          Projects, solution expansion, positional files
  reporters.test.ts      Golden output per format, schema validation
  cli.test.ts            Spawns bin/kita-html.js on real projects (needs `pnpm build`)
```

## Key rules

- Every runtime import from `typescript/*` goes through `src/typescript.ts`
  (`loadTypeScript`). The analyzer receives the loaded modules as `ctx.ts`. Type-only
  imports are fine anywhere.
- Never hardcode `TypeFlags` or `SyntaxKind` values. They differ from TypeScript 6.
- Type and symbol getters (`getTypes()`, `getAliasSymbol()`, `checker.*`) are IPC round
  trips. Cache per type id when a value is read more than once (see `kita-types.ts`).
- Compare types and symbols by `.id`, not by object identity.
- Keep function names and comments in `src/analyzer/` aligned with
  `packages/ts-html-plugin/src/util.ts`, so rule fixes can be mirrored between both.
- Set `process.exitCode` instead of calling `this.exit()`. oclif handles `ExitError` with
  `process.exit()` without flushing stdout, which truncates large piped reports (covered
  by a CLI test).
- oclif exits 2 on parse errors. `Check.catch` maps those to 1, because 2 means "only
  warnings".
- Report output goes to stdout. Notices and errors go to stderr (`this.warn`,
  `this.error`).

## Development

```bash
pnpm build        # tsgo -p tsconfig.build.json
pnpm test         # vitest; cli.test.ts requires a build first
pnpm test-types   # tsgo --noEmit
```

The package uses TypeScript 7.1 from the `ts7` pnpm catalog, pinned to a nightly until 7.1
is stable. The rest of the workspace stays on TypeScript 6 through the default catalog.

Rule tests use `openWithDiagnostics` from `test/util/project.ts`. It prepends the same
`TEST_HELPERS` prelude as the old plugin's tests, so line numbers and offsets match.
