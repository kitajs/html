# Suggested Development Commands

## Package Manager

**Always use pnpm** - The project enforces this via preinstall hook. Requires pnpm >= 10.

## Main Development Commands

### Building

```bash
# Build all packages
pnpm build

# Build specific package (from root)
pnpm --filter "@kitajs/html" build

# Build uses tsgo (native TypeScript compiler preview)
# Each package has: pnpm build -> tsgo -p tsconfig.build.json
```

### Testing

```bash
# Run all tests in all packages
pnpm test

# Run tests in a specific package
pnpm --filter "@kitajs/html" test
cd packages/html && pnpm test

# Test command runs Vitest with coverage and type checking:
# vitest --coverage --typecheck --run
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
pnpm changeset

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
pnpm build    # Build with tsgo
pnpm test     # Run vitest with coverage and typecheck
```

### @kitajs/ts-html-plugin

```bash
cd packages/ts-html-plugin
pnpm build    # Build with tsgo
pnpm test     # Run vitest with coverage and typecheck
```

### @kitajs/fastify-html-plugin

```bash
cd packages/fastify-html-plugin
pnpm build    # Build with tsgo
pnpm test     # Run vitest with coverage and typecheck
```

## Common Workflows

### After making changes:

1. Format code: `pnpm format` (or let pre-commit hook handle it)
2. Build: `pnpm build`
3. Run tests: `pnpm test`

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

### Running examples:

```bash
npx tsx examples/fastify-htmx.tsx
npx tsx examples/http-server.tsx
```
