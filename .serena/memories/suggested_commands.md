# Suggested Development Commands

## Package Manager

**Always use pnpm** - The project enforces this via preinstall hook.

## Main Development Commands

### Building

```bash
# Build all packages
pnpm build

# Build with watch mode (rebuilds on changes)
pnpm watch

# Build specific package (from root)
pnpm --filter "@kitajs/html" build
```

### Testing

```bash
# Run all tests in all packages
pnpm test

# Run tests in a specific package (from package directory)
cd packages/html
pnpm test

# For packages/html specifically:
# - Compiles TypeScript
# - Runs tests with c8 coverage
# - Uses Node.js native test runner
# - Test files: dist/test/**/*.test.js (compiled from test/*.test.tsx)

# Run only tests marked with .only
pnpm test:only

# Watch mode (for fastify-html-plugin)
pnpm --filter "@kitajs/fastify-html-plugin" test:watch
```

### Formatting

```bash
# Format all files
pnpm format

# Format specific files (Prettier)
prettier --write <file-path>
```

### Benchmarking

```bash
# Run performance benchmarks
pnpm bench

# This builds benchmark packages and runs the benchmark runner
```

### Versioning & Publishing

```bash
# Create a changeset (for version bumps)
pnpm change

# Version packages (CI command)
pnpm ci-version

# Publish packages (CI command)
pnpm ci-publish
```

### Git Hooks

Git hooks are managed by Husky:

- **pre-commit**: Automatically formats staged files with Prettier
- Setup: `pnpm prepare` (runs `husky` command)

## Per-Package Commands

### @kitajs/html

```bash
cd packages/html
pnpm test         # Run tests with coverage
pnpm test:only    # Run only .only tests
pnpm bench        # Run benchmarks
```

### @kitajs/fastify-html-plugin

```bash
cd packages/fastify-html-plugin
pnpm test         # Run tests with tsd and c8
pnpm test:watch   # Watch mode for tests
```

## Common Workflows

### After making changes:

1. Format code: `pnpm format` (or let pre-commit hook handle it)
2. Run tests: `pnpm test`
3. Build: `pnpm build`

### Before committing:

- Pre-commit hook automatically runs Prettier on staged files
- No manual action needed

### Testing a single package:

```bash
pnpm --filter "@kitajs/html" test
```

### Working with workspace:

```bash
# Install dependencies
pnpm install

# Run command in all packages
pnpm -r <command>

# Run command in specific package
pnpm --filter "<package-name>" <command>

# Run commands in parallel
pnpm -r --parallel <command>
```
