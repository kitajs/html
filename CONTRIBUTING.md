# Contributing to Kita Html

## Prerequisites

pnpm is the only supported package manager. The `preinstall` script enforces this. Node.js
20.13 or later is required.

```bash
pnpm install
```

## Repository Structure

```
packages/
  html/                  @kitajs/html            Core JSX runtime
  ts-html-plugin/        @kitajs/ts-html-plugin  XSS detection (TS plugin + CLI)
  fastify-html-plugin/   @kitajs/fastify-html-plugin  Fastify integration
  docs/                  @kitajs/docs-html       Documentation site
benchmarks/              Performance benchmarks
examples/                Usage examples (fastify-htmx, http-server)
```

## Commands

### Root-level (all packages)

```bash
pnpm build          # Build all packages (via Turbo)
pnpm test           # Run all tests (via Turbo)
pnpm format         # Format all files with Prettier
pnpm bench          # Run benchmarks
pnpm test-types     # Type-check all packages
```

### Per-package

Use `-F` (short for `--filter`) to target a specific package.

```bash
pnpm -F @kitajs/html build
pnpm -F @kitajs/html test
pnpm -F @kitajs/ts-html-plugin build
pnpm -F @kitajs/ts-html-plugin test
pnpm -F @kitajs/fastify-html-plugin test
pnpm -F @kitajs/docs-html build
pnpm -F @kitajs/docs-html dev        # Dev server on port 1229
```

All packages use `tsgo -p tsconfig.build.json` for building and
`vitest --coverage --typecheck --run` for testing.

### Formatting

Prettier is the sole formatter. Run `pnpm format` before committing. Husky pre-commit
hooks enforce this, but running it manually avoids surprises.

## Making Changes

### Iterative development workflow

When making changes to a specific package, follow this cycle to catch errors early:

1. Make a logical group of changes (e.g., implement one function, fix one bug)
2. Run package-specific validation:
   ```bash
   pnpm -F <package-name> build
   pnpm -F <package-name> test-types
   pnpm -F <package-name> test
   ```
3. Fix any issues immediately before moving to the next group of changes
4. Repeat for each logical change group

This approach prevents accumulating broken code. Testing after each change makes debugging
easier than gathering all feedback at the end.

### Code changes

1. Make your changes in the relevant `packages/*/src/` directory
2. Follow the iterative workflow above (test frequently)
3. Update documentation (see below)
4. Complete pre-push checklist (see below)

### Documentation changes

The documentation site lives at `packages/docs/`. All docs are markdown files under
`packages/docs/docs/`. The site uses Rspress and follows the Information Mapping
methodology. See `packages/docs/CLAUDE.md` for the full conventions.

After editing any documentation file:

```bash
pnpm format
pnpm -F @kitajs/docs-html build
```

The build must exit with code 0. Broken links and invalid markdown will cause build
failures.

### Adding a new doc page

1. Create the `.md` file in the correct directory under `packages/docs/docs/`
2. Add the filename (without extension) to the directory's `_meta.json`
3. Format and build to verify

## Documentation Rule

Any change to the runtime, types, API surface, configuration, or behavior of any package
must include a corresponding update to the documentation at `packages/docs/`. This applies
to new features, changed behavior, removed functionality, renamed exports, and modified
defaults. If a code change would make any existing documentation page inaccurate, update
that page in the same commit.

## Testing

Tests use Vitest with V8 coverage and type checking enabled.

When writing tests, cover these areas:

- XSS safety with malicious input samples
- Both sync and async component paths
- Type correctness (Vitest runs `--typecheck`)
- Performance regressions for core changes (run `pnpm bench`)

### Debugging TypeScript Plugin Tests

For `@kitajs/ts-html-plugin` tests, you can enable debug output by passing `true` as the
second parameter to `TSLangServer`:

```typescript
const server = new TSLangServer(projectPath, true); // Enable debug mode
```

Debug mode provides:

- Console output of all TypeScript server requests and responses
- A `tss.log` file in the project directory with verbose logging
- File content displayed with line numbers

**Note**: Only use debug mode once per test file. Multiple debug-enabled instances will
overwrite the `tss.log` file. Run tests individually or use separate test files when
debugging.

## Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for version
management. After making your changes, create a changeset:

```bash
pnpm changeset
```

Select the affected packages, choose the semver bump level, and write a short description.
The changeset file is committed with your PR.

## Pre-Push Checklist

Before pushing code or submitting a PR, complete these steps in order:

1. **Format code**: `pnpm format`
2. **Build all packages**: `pnpm build` (must exit with code 0)
3. **Type-check all packages**: `pnpm test-types` (must exit with code 0)
4. **Run all tests**: `pnpm test` (must exit with code 0)
5. **Create changeset**: `pnpm changeset` (see Changesets section)

The changeset file must be committed with your changes.

## Pull Requests

Every PR must include a changeset entry.

1. Fork and clone the repository
2. Create a branch for your changes
3. Make changes following the iterative workflow
4. Update documentation
5. Complete pre-push checklist
6. Submit PR
