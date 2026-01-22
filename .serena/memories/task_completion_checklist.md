# Task Completion Checklist

When completing a coding task in this project, follow these steps:

## 1. Code Quality

- [ ] TypeScript compiles without errors (`tsc`)
- [ ] Code follows strict TypeScript settings (no `any`, proper null checks)
- [ ] No unused variables or parameters
- [ ] All functions have proper return types

## 2. Formatting

- [ ] Code is formatted with Prettier
  - Run: `pnpm format`
  - Or let pre-commit hook handle it automatically

## 3. XSS Safety (Critical for this project!)

- [ ] All user input uses `safe` attribute or `Html.escapeHtml()`
- [ ] No raw string concatenation with user input
- [ ] TypeScript plugin catches potential XSS vulnerabilities
- [ ] Consider running `xss-scan` if modifying JSX/HTML generation code

## 4. Testing

- [ ] Run tests: `pnpm test` (from root or package directory)
- [ ] All tests pass with no failures
- [ ] Code coverage is maintained or improved (c8 reports)
- [ ] For new features: Add appropriate tests in `test/` directory

## 5. Build

- [ ] Build succeeds: `pnpm build`
- [ ] No build warnings or errors
- [ ] Type definitions (.d.ts) are correctly generated

## 6. Documentation

- [ ] Update README.md if adding new features or changing APIs
- [ ] Add JSDoc comments for public APIs
- [ ] Update type definitions if needed
- [ ] Consider updating examples if relevant

## 7. Performance (if applicable)

- [ ] Consider running benchmarks if changes affect core HTML generation
  - Run: `pnpm bench`
- [ ] No performance regressions

## 8. Version Management (if releasing)

- [ ] Create changeset if making user-facing changes
  - Run: `pnpm change`
- [ ] Follow semantic versioning

## 9. Git

- [ ] Commit messages are clear and descriptive
- [ ] Pre-commit hook has run (Prettier formatting)
- [ ] No unnecessary files committed
- [ ] Changes are focused and atomic

## Quick Check Before Committing

From the root directory:

```bash
pnpm format    # Format code
pnpm build     # Build all packages
pnpm test      # Run all tests
```

If all three succeed, the code is ready to commit!

## Special Considerations

### For Core HTML Package (@kitajs/html)

- XSS safety is CRITICAL - always verify proper escaping
- Performance matters - avoid unnecessary allocations
- Type safety - ensure JSX types are correct

### For TypeScript Plugin (@kitajs/ts-html-plugin)

- Test with real TypeScript projects
- Ensure error messages are clear and helpful

### For Fastify Plugin (@kitajs/fastify-html-plugin)

- Test integration with Fastify
- Ensure type definitions work correctly (tsd tests)
