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

### Code changes

1. Make your changes in the relevant `packages/*/src/` directory
2. Run `pnpm format` to format
3. Run `pnpm build` to compile
4. Run `pnpm test` to verify tests pass
5. Update documentation (see below)

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

## Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for version
management. After making your changes, create a changeset:

```bash
pnpm changeset
```

Select the affected packages, choose the semver bump level, and write a short description.
The changeset file is committed with your PR.

## Pull Requests

Every PR must include a changeset entry. Run `pnpm changeset` before submitting, select
the affected packages, choose the semver bump level, and write a short description. The
generated changeset file is committed with your PR.

1. Fork and clone the repository
2. Create a branch for your changes
3. Make changes and update documentation
4. `pnpm format`
5. `pnpm build`
6. `pnpm test`
7. `pnpm changeset`
8. Submit PR
