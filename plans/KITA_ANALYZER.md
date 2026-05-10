# Plan: Split `@kitajs/ts-html-plugin` → `@kitajs/html-analyzer` + thin plugin

## Decisions

| Decision                     | Choice                                          |
| ---------------------------- | ----------------------------------------------- |
| Test util (`lang-server.ts`) | Stays only in ts-html-plugin                    |
| CLI (`cli.ts`)               | Stays in ts-html-plugin                         |
| `proxyObject`                | Stays in ts-html-plugin                         |
| `diagnoseJsxElement`         | Stays private (not exported from html-analyzer) |
| Analyzer tests               | Use TS compiler API directly (no tsserver)      |

## Target structure

```
packages/
├── html-analyzer/                    # NEW — @kitajs/html-analyzer
│   ├── src/
│   │   ├── index.ts                  # Barrel: re-exports public API
│   │   ├── util.ts                   # Moved from ts-html-plugin (core detection)
│   │   └── errors.ts                 # Moved from ts-html-plugin (error codes)
│   ├── test/
│   │   ├── util/
│   │   │   └── diagnose.ts           # NEW: In-memory TS program test helper
│   │   ├── arrays.test.ts            # Moved (adapted for new test helper)
│   │   ├── children.test.ts          # Moved (adapted)
│   │   ├── component-xss.test.ts     # Moved (adapted)
│   │   ├── double-escape.test.ts     # Moved (adapted)
│   │   ├── operators.test.ts         # Moved (adapted)
│   │   ├── readme.test.ts            # Moved (adapted)
│   │   ├── safe.test.ts              # Moved (adapted)
│   │   ├── unsafe-tags.test.ts       # Moved (adapted)
│   │   └── warn.test.ts              # Moved (adapted)
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── vitest.config.ts
│   ├── LICENSE
│   └── CLAUDE.md
│
├── ts-html-plugin/                   # SLIMMED — @kitajs/ts-html-plugin
│   ├── src/
│   │   ├── index.ts                  # Plugin entry (imports from @kitajs/html-analyzer)
│   │   └── cli.ts                    # CLI tool (imports from @kitajs/html-analyzer)
│   ├── test/
│   │   ├── util/
│   │   │   ├── lang-server.ts        # Kept — tsserver test helper
│   │   │   └── index.tsx             # Kept — placeholder
│   │   ├── tsconfig.json             # Kept
│   │   └── plugin.test.ts            # NEW: Minimal tsserver integration test
│   ├── bin/
│   │   └── index.js                  # Unchanged
│   ├── package.json                  # + dependency on @kitajs/html-analyzer
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── vitest.config.ts
│   └── LICENSE
```

## Phase 1: Create `@kitajs/html-analyzer` package scaffold

### Step 1 — Create `packages/html-analyzer/package.json`

```json
{
  "name": "@kitajs/html-analyzer",
  "version": "1.0.0",
  "description": "XSS detection and JSX analysis engine for @kitajs/html",
  "homepage": "https://github.com/kitajs/html/tree/master/packages/html-analyzer#readme",
  "bugs": "https://github.com/kitajs/html/issues",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/kitajs/html.git",
    "directory": "packages/html-analyzer"
  },
  "funding": "https://github.com/kitajs/html?sponsor=1",
  "license": "MIT",
  "author": "Arthur Fiorette <kita@arthur.place>",
  "sideEffects": false,
  "type": "commonjs",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js"
  },
  "files": ["dist", "src", "!dist/*.tsbuildinfo"],
  "scripts": {
    "build": "tsgo -p tsconfig.build.json",
    "test": "vitest --coverage --typecheck --run",
    "test-types": "tsgo --noEmit"
  },
  "dependencies": {
    "tslib": "catalog:"
  },
  "devDependencies": {
    "@kitajs/html": "workspace:^",
    "@types/node": "catalog:",
    "@typescript/native-preview": "catalog:",
    "@vitest/coverage-v8": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  },
  "peerDependencies": {
    "typescript": "catalog:"
  }
}
```

### Step 2 — Create `tsconfig.json`, `tsconfig.build.json`, `vitest.config.ts`, copy `LICENSE`

## Phase 2: Move core logic

### Step 3 — Move `ts-html-plugin/src/util.ts` → `html-analyzer/src/util.ts`

Remove `proxyObject` from the file (it stays in ts-html-plugin). The moved file keeps:

- `recursiveDiagnoseJsxElements` (exported)
- `isSafeAttribute` (exported)
- `getSafeAttribute` (exported)
- `diagnoseJsxElement` (private — not exported but used internally)
- `diagnoseExpression` (private)
- `getNodeExpressions` (private)
- `isBooleanBinaryOperatorToken` (private)
- `isJsx` (private)

### Step 4 — Move `ts-html-plugin/src/errors.ts` → `html-analyzer/src/errors.ts` (unchanged)

### Step 5 — Create `html-analyzer/src/index.ts` — barrel file

```typescript
export { recursiveDiagnoseJsxElements, isSafeAttribute, getSafeAttribute } from './util'
export * as Errors from './errors'
```

## Phase 3: Create new test infrastructure for html-analyzer

### Step 6 — Create `html-analyzer/test/util/diagnose.ts`

In-memory TS program test helper using the compiler API directly (no tsserver):

```typescript
import path from 'node:path'
import ts from 'typescript'
import { recursiveDiagnoseJsxElements } from '../../src/util'

// Same test helpers as the old lang-server.ts TEST_HELPERS
const TEST_HELPERS = `
  import Html, { type PropsWithChildren, e } from '@kitajs/html';
  const date = new Date();
  const safeString: string = 'safe';
  // ... (same variables as before)
  function Component(props: PropsWithChildren) {
    return <div>{props.children}</div>;
  }
`.trim()

// Ensure monorepo pnpm symlink resolution works
process.env.KITA_TS_HTML_PLUGIN_TESTING = 'true'

const OPTIONS: ts.CompilerOptions = {
  strict: true,
  noEmit: true,
  jsx: ts.JsxEmit.ReactJSX,
  jsxImportSource: '@kitajs/html',
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ESNext,
  skipLibCheck: true
}

/**
 * Diagnoses XSS issues in the given TSX code string. Uses the TS compiler API directly —
 * no tsserver needed.
 */
export function diagnoseXss(
  strings: TemplateStringsArray,
  ...values: unknown[]
): ts.Diagnostic[] {
  const code = `${TEST_HELPERS}\n${String.raw(strings, ...values).trim()}`

  // Virtual file path in a real directory so @kitajs/html resolves
  const fileName = path.join(__dirname, '__virtual_test__.tsx')

  const sourceFile = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ true,
    ts.ScriptKind.TSX
  )

  const host = ts.createCompilerHost(OPTIONS)
  const origGetSourceFile = host.getSourceFile
  const origFileExists = host.fileExists
  const origReadFile = host.readFile

  host.getSourceFile = (name, langVer, onError, shouldCreate) => {
    if (name === fileName) return sourceFile
    return origGetSourceFile.call(host, name, langVer, onError, shouldCreate)
  }
  host.fileExists = (name) => name === fileName || origFileExists.call(host, name)
  host.readFile = (name) => (name === fileName ? code : origReadFile.call(host, name))

  const program = ts.createProgram([fileName], OPTIONS, host)
  const checker = program.getTypeChecker()
  const sf = program.getSourceFile(fileName)!

  const diagnostics: ts.Diagnostic[] = []
  ts.forEachChild(sf, (node) => {
    recursiveDiagnoseJsxElements(ts, node, checker, diagnostics)
  })

  return diagnostics
}
```

### Step 7 — Move and adapt all 9 test files

Move from `ts-html-plugin/test/` → `html-analyzer/test/`.

The adaptation is straightforward. Each test currently does:

```typescript
// OLD (tsserver-based)
const server = new TSLangServer(ROOT)
const response = await server.openWithDiagnostics`...jsx code...`
expect(response.body).toHaveLength(N)
expect(response.body![0]!.code).toBe(88601)
```

Becomes:

```typescript
// NEW (compiler API-based)
const diagnostics = diagnoseXss`...jsx code...`
expect(diagnostics).toHaveLength(N)
expect(diagnostics[0]!.code).toBe(88601)
```

Key differences in adaptation:

- No `await using server = new TSLangServer(ROOT)` — synchronous function call instead
- No `response.body` — direct `ts.Diagnostic[]` array
- Same `code` field (88601, 88602, 88603, 88604)
- Tests become synchronous (faster)
- No need for `Symbol.asyncDispose` or cleanup

## Phase 4: Update ts-html-plugin to import from html-analyzer

### Step 8 — Update `ts-html-plugin/src/index.ts`

```typescript
import type { default as TS, server } from 'typescript/lib/tsserverlibrary';
import { recursiveDiagnoseJsxElements } from '@kitajs/html-analyzer';

// proxyObject stays here, inlined or in a local util
function proxyObject<T extends object>(obj: T): T { ... }

export = function (modules: { typescript: typeof TS }) {
  // ... same as before, using imported recursiveDiagnoseJsxElements
};
```

### Step 9 — Update `ts-html-plugin/src/cli.ts`

```typescript
import { recursiveDiagnoseJsxElements } from '@kitajs/html-analyzer'
// ... rest stays the same
```

### Step 10 — Delete `ts-html-plugin/src/util.ts` and `ts-html-plugin/src/errors.ts`

### Step 11 — Update `ts-html-plugin/package.json`

- Add dependency: `"@kitajs/html-analyzer": "workspace:^"`
- Remove `tslib` (no longer needed since util.ts is gone — unless cli.ts uses it)
- Keep `chalk`, `yargs` (used by cli.ts)
- Keep `typescript` as peer dep

## Phase 5: Create minimal plugin integration test

### Step 12 — Replace all tests in `ts-html-plugin/test/` with a single `plugin.test.ts`

```typescript
// Minimal test: proves tsserver loads the plugin and the plugin
// correctly calls html-analyzer and returns diagnostics
describe('ts-html-plugin tsserver integration', () => {
  it('should report XSS diagnostic (TS88601) for unsafe content', async () => {
    await using server = new TSLangServer(ROOT)
    const response = await server.openWithDiagnostics`
      <div>{html}</div>
    `
    expect(response.body).toHaveLength(1)
    expect(response.body![0]!.code).toBe(88601)
  })

  it('should report no diagnostics for safe content', async () => {
    await using server = new TSLangServer(ROOT)
    const response = await server.openWithDiagnostics`
      <div>{number}</div>
    `
    expect(response.body).toHaveLength(0)
  })

  it('should report DoubleEscape (TS88602) for safe + JSX', async () => {
    await using server = new TSLangServer(ROOT)
    const response = await server.openWithDiagnostics`
      <div safe><span /></div>
    `
    expect(response.body).toHaveLength(1)
    expect(response.body![0]!.code).toBe(88602)
  })

  it('should report ComponentXss (TS88603) for unsafe component children', async () => {
    await using server = new TSLangServer(ROOT)
    const response = await server.openWithDiagnostics`
      <Component>{html}</Component>
    `
    expect(response.body).toHaveLength(1)
    expect(response.body![0]!.code).toBe(88603)
  })
})
```

This covers all 4 error codes through the full tsserver→plugin→analyzer chain, proving the
binding works end-to-end.

### Step 13 — Remove old test files from ts-html-plugin

Remove `arrays.test.ts`, `children.test.ts`, `component-xss.test.ts`,
`double-escape.test.ts`, `operators.test.ts`, `readme.test.ts`, `safe.test.ts`,
`unsafe-tags.test.ts`, `warn.test.ts` from ts-html-plugin since they now live in
html-analyzer.

## Phase 6: Build and verify

### Step 14 — Run `pnpm install` to resolve new workspace dependencies

### Step 15 — Run `pnpm build` (turbo's `^build` ensures html-analyzer builds before ts-html-plugin)

### Step 16 — Run `pnpm -F @kitajs/html-analyzer test` (verify all 9 test files pass)

### Step 17 — Run `pnpm -F @kitajs/ts-html-plugin test` (verify minimal integration test passes)

### Step 18 — Run `pnpm test` (full monorepo test suite)

## Phase 7: Documentation and changesets

### Step 19 — Create `packages/html-analyzer/CLAUDE.md`

### Step 20 — Update `packages/ts-html-plugin/CLAUDE.md` to reflect slimmer scope

### Step 21 — Update root `CLAUDE.md` (repository structure, package dependency diagram)

### Step 22 — Update `CONTRIBUTING.md`

### Step 23 — Update docs in `packages/docs/` if needed

### Step 24 — Create changesets for both packages

## Dependency graph after split

```
@kitajs/html (core)
    ↑
    ├── @kitajs/html-analyzer (peer: typescript)
    │       ↑
    │       ├── @kitajs/ts-html-plugin (deps: chalk, yargs + analyzer)
    │       │
    │       └── @kitajs/html-cli (future)
    │
    └── @kitajs/fastify-html-plugin
```

## Risk assessment

| Risk                                                       | Mitigation                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| In-memory TS program can't resolve `@kitajs/html` types    | Virtual file path anchored in real directory with node_modules access      |
| `KITA_TS_HTML_PLUGIN_TESTING` env var still needed         | Set in test helper's module scope                                          |
| `proxyObject` import removed from util.ts but plugin needs | Inlined in ts-html-plugin's `src/index.ts` (or a local `src/util.ts`)      |
| Test behavior differs between compiler API and tsserver    | Minimal tsserver integration test in ts-html-plugin catches binding issues |
| Circular dependency risk                                   | None — html-analyzer has no dependency on ts-html-plugin                   |
