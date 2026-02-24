---
name: kita-dev-workflow
description:
  Development workflow for the Kita Html monorepo. Use when making code changes, adding
  features, fixing bugs, or refactoring. Covers formatting, testing, building, changesets,
  and pre-push validation.
user-invocable: false
---

# Kita Html Monorepo Development Workflow

You are working on the Kita Html monorepo. Follow this workflow exactly for all code
changes.

## Core Principles

1. **Test frequently** — Run tests and builds on the specific package after each logical
   group of changes, not just at the end
2. **Format before commit** — Always run `pnpm format` before pushing code
3. **Changeset required** — Every PR must include a changeset entry
4. **Documentation updates** — Any API, type, or behavior change requires documentation
   updates
5. **Full validation before finish** — Run root-level `pnpm build`, `pnpm test-types`, and
   `pnpm test` before considering work complete

## Iterative Development Cycle

When making changes to a specific package, follow this cycle:

1. Make a logical group of changes (e.g., implement one function, fix one bug, add one
   feature)
2. Run package-specific validation:
   ```bash
   pnpm -F <package-name> build
   pnpm -F <package-name> test-types
   pnpm -F <package-name> test
   ```
3. Fix any issues immediately
4. Repeat for the next group of changes

**Why**: Catching errors early prevents accumulating broken code. Waiting until all
changes are complete means gathering all broken feedback at once, making debugging harder.

### Package Names

- `@kitajs/html` — Core JSX runtime
- `@kitajs/ts-html-plugin` — XSS detection TypeScript plugin
- `@kitajs/fastify-html-plugin` — Fastify integration
- `@kitajs/docs-html` — Documentation site

### Example Workflow

```bash
# After implementing a new function in @kitajs/html
pnpm -F @kitajs/html build
pnpm -F @kitajs/html test-types
pnpm -F @kitajs/html test

# After adding tests
pnpm -F @kitajs/html test

# After updating docs
pnpm format
pnpm -F @kitajs/docs-html build
```

## Pre-Push Checklist

Before pushing code or submitting a PR, complete these steps in order:

### 1. Format Code

```bash
pnpm format
```

Prettier is the sole formatter. Husky pre-commit hooks enforce this, but running manually
avoids surprises.

### 2. Build All Packages

```bash
pnpm build
```

This runs Turbo cache-aware builds for all packages. Must exit with code 0.

### 3. Type-Check All Packages

```bash
pnpm test-types
```

Runs `tsc --noEmit` on all packages. Must exit with code 0.

### 4. Run All Tests

```bash
pnpm test
```

Runs Vitest with coverage and type checking across all packages. Must exit with code 0.

### 5. Create Changeset

```bash
pnpm changeset
```

Interactive prompt asks:

1. Which packages changed? (Select with space, confirm with enter)
2. What semver bump level? (`patch`, `minor`, `major`)
3. Summary description (appears in CHANGELOG)

This creates a file in `.changeset/` with a random name like `hip-trams-roll.md`.

**Commit the changeset file with your changes.**

## Changeset Format

Changesets use frontmatter with package names and semver levels, followed by a brief
description.

### Examples

**Single package patch (bug fix)**:

```markdown
---
'@kitajs/ts-html-plugin': patch
---

Skip xss check for `str &&` cases
```

**Single package major (breaking change)**:

```markdown
---
'@kitajs/html': major
---

Removed deprecated @kitajs/html/register
```

**Multiple packages**:

```markdown
---
'@kitajs/html': minor
'@kitajs/ts-html-plugin': patch
---

Added new escapeHtml option and improved detection
```

### Guidelines

- One line description preferred
- Use present tense: "Add", "Fix", "Remove", "Update"
- Be specific about what changed, not why
- No period at the end for single-line descriptions
- Multiline descriptions are allowed for complex changes

### Semver Levels

- `patch` — Bug fixes, internal refactors, documentation, performance improvements
- `minor` — New features, new exports, non-breaking additions
- `major` — Breaking changes, removed exports, changed behavior, renamed types

## Documentation Rule

Any change to the runtime, types, API surface, configuration, or behavior of any package
**must** include a corresponding update to the documentation at `packages/docs/`.

This includes:

- New features
- Changed behavior
- Removed functionality
- Renamed exports
- Modified defaults
- New configuration options

If a code change would make any existing documentation page inaccurate, update that page
in the same commit.

### Documentation Verification

After editing documentation:

```bash
pnpm format
pnpm -F @kitajs/docs-html build
```

The build must exit with code 0. Broken links and invalid markdown cause build failures.

For documentation writing conventions, the `rspress-writing` and `information-mapping`
skills provide detailed guidance.

## Common Commands Reference

### Root-level (all packages)

```bash
pnpm install        # Install dependencies (pnpm required)
pnpm build          # Build all packages (Turbo)
pnpm test           # Run all tests (Turbo)
pnpm test-types     # Type-check all packages
pnpm format         # Format all files with Prettier
pnpm bench          # Run benchmarks
```

### Per-package

```bash
pnpm -F @kitajs/html build
pnpm -F @kitajs/html test
pnpm -F @kitajs/html test-types
pnpm -F @kitajs/ts-html-plugin build
pnpm -F @kitajs/ts-html-plugin test
pnpm -F @kitajs/fastify-html-plugin build
pnpm -F @kitajs/fastify-html-plugin test
pnpm -F @kitajs/docs-html build
pnpm -F @kitajs/docs-html dev    # Dev server on port 1229
```

## Testing Strategy

Tests use Vitest with V8 coverage and type checking enabled.

When writing tests, cover:

- XSS safety with malicious input samples
- Both sync and async component paths
- Type correctness (Vitest runs `--typecheck`)
- Edge cases and error conditions

For core changes that may affect performance, run benchmarks:

```bash
pnpm bench
```

### Debugging TypeScript Plugin Tests

For `@kitajs/ts-html-plugin` tests, enable debug output by passing `true` as the second
parameter to `TSLangServer`:

```typescript
const server = new TSLangServer(projectPath, true); // Enable debug mode
```

Debug mode provides:

- Console output of all TypeScript server requests and responses
- A `tss.log` file in the project directory with verbose logging
- File content displayed with line numbers

**Important**: Only use debug mode once per test file. Multiple debug-enabled instances
will overwrite the `tss.log` file. Run tests individually or use separate test files when
debugging.

## Workflow Summary

**During development** (repeat for each logical group of changes):

1. Make changes
2. `pnpm -F <package> build`
3. `pnpm -F <package> test-types`
4. `pnpm -F <package> test`
5. Fix any issues before moving to next group

**Before pushing** (run once after all changes are complete):

1. `pnpm format`
2. `pnpm build`
3. `pnpm test-types`
4. `pnpm test`
5. `pnpm changeset`
6. Commit changeset file

**For documentation changes**:

1. Update relevant `.md` files in `packages/docs/docs/`
2. `pnpm format`
3. `pnpm -F @kitajs/docs-html build`

## Prerequisites

- **pnpm** is the only supported package manager (enforced by preinstall script)
- **Node.js 20.13+** required
- **TypeScript 5.9+** for development

## Common Pitfalls

1. **Forgetting to run package-specific tests** — Don't wait until the end. Test after
   each logical change group.
2. **Skipping format** — Husky hooks will reject commits without formatting, but run
   manually to avoid surprises.
3. **No changeset** — PRs without changesets will be rejected. Run `pnpm changeset` before
   submitting.
4. **Outdated documentation** — Any API change requires documentation updates in the same
   commit.
5. **Only testing locally** — Always run root-level `pnpm build`, `pnpm test-types`, and
   `pnpm test` before pushing.

## Repository Structure Quick Reference

```
packages/
  html/                  @kitajs/html            Core JSX runtime
  ts-html-plugin/        @kitajs/ts-html-plugin  XSS detection
  fastify-html-plugin/   @kitajs/fastify-html-plugin  Fastify integration
  docs/                  @kitajs/docs-html       Documentation site
benchmarks/              Performance benchmarks
examples/                Usage examples
```

Each package has:

- `src/` — Source files
- `test/` — Vitest tests
- `tsconfig.json` — TypeScript config
- `tsconfig.build.json` — Build-specific config
- `package.json` — Package manifest

## Git Workflow

This repository uses Husky for git hooks. The pre-commit hook runs `pnpm format`
automatically.

Typical flow:

1. Create a feature branch
2. Make changes following the iterative development cycle
3. Complete pre-push checklist
4. Push and open PR

Every PR must include a changeset entry.
