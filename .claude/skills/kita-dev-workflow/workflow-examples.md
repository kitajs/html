# Workflow Examples

## Example 1: Adding a New Function to @kitajs/html

**Scenario**: Add a new `escapeAttribute()` function to the core runtime.

### Step 1: Implement the function

Edit `packages/html/src/index.ts` to add the function.

### Step 2: Test the package

```bash
pnpm -F @kitajs/html build
pnpm -F @kitajs/html test-types
pnpm -F @kitajs/html test
```

If tests fail, fix them before proceeding.

### Step 3: Add tests

Create tests in `packages/html/test/escape-attribute.test.ts`.

```bash
pnpm -F @kitajs/html test
```

### Step 4: Update documentation

Add documentation for the new function in `packages/docs/docs/api/html/`.

```bash
pnpm format
pnpm -F @kitajs/docs-html build
```

### Step 5: Pre-push validation

```bash
pnpm build
pnpm test-types
pnpm test
```

### Step 6: Create changeset

```bash
pnpm changeset
```

Select:

- Package: `@kitajs/html`
- Bump: `minor` (new feature)
- Summary: `Add escapeAttribute function for safer attribute rendering`

### Step 7: Commit and push

```bash
git add .
git commit -m "feat: add escapeAttribute function"
git push
```

---

## Example 2: Fixing a Bug in @kitajs/ts-html-plugin

**Scenario**: Fix false positive XSS warning for string literals.

### Step 1: Reproduce the bug

Create a test case in `packages/ts-html-plugin/test/` that demonstrates the bug.

```bash
pnpm -F @kitajs/ts-html-plugin test
```

Confirm the test fails.

### Step 2: Fix the bug

Edit `packages/ts-html-plugin/src/util.ts` to fix the detection logic.

### Step 3: Verify the fix

```bash
pnpm -F @kitajs/ts-html-plugin build
pnpm -F @kitajs/ts-html-plugin test-types
pnpm -F @kitajs/ts-html-plugin test
```

All tests should pass.

### Step 4: Check if documentation needs updates

In this case, the behavior is a bug fix, not a feature change, so no documentation update
is needed. However, if the fix changes any documented behavior, update the relevant docs.

### Step 5: Pre-push validation

```bash
pnpm format
pnpm build
pnpm test-types
pnpm test
```

### Step 6: Create changeset

```bash
pnpm changeset
```

Select:

- Package: `@kitajs/ts-html-plugin`
- Bump: `patch` (bug fix)
- Summary: `Fix false positive XSS warning for string literals`

### Step 7: Commit and push

```bash
git add .
git commit -m "fix: false positive XSS warning for string literals"
git push
```

---

## Example 3: Updating Documentation Only

**Scenario**: Improve the XSS protection guide.

### Step 1: Edit documentation

Edit `packages/docs/docs/guide/xss/safe-attribute.md`.

### Step 2: Verify the changes

```bash
pnpm format
pnpm -F @kitajs/docs-html build
```

Build must succeed.

### Step 3: Create changeset

```bash
pnpm changeset
```

Select:

- Package: `@kitajs/docs-html`
- Bump: `patch` (documentation improvement)
- Summary: `Improve XSS protection guide clarity`

### Step 4: Commit and push

```bash
git add .
git commit -m "docs: improve XSS protection guide"
git push
```

---

## Example 4: Breaking Change Across Multiple Packages

**Scenario**: Remove deprecated `Html.contentsToString()` function and update all packages
that use it.

### Step 1: Plan the changes

This affects:

- `@kitajs/html` (remove function)
- `@kitajs/fastify-html-plugin` (update usage)
- `@kitajs/docs-html` (update documentation)

### Step 2: Update @kitajs/html

Remove the function from `packages/html/src/index.ts`.

```bash
pnpm -F @kitajs/html build
pnpm -F @kitajs/html test-types
pnpm -F @kitajs/html test
```

### Step 3: Update @kitajs/fastify-html-plugin

Update any code that used the removed function.

```bash
pnpm -F @kitajs/fastify-html-plugin build
pnpm -F @kitajs/fastify-html-plugin test-types
pnpm -F @kitajs/fastify-html-plugin test
```

### Step 4: Update documentation

Remove or update references to the removed function in `packages/docs/`.

```bash
pnpm format
pnpm -F @kitajs/docs-html build
```

### Step 5: Pre-push validation

```bash
pnpm build
pnpm test-types
pnpm test
```

### Step 6: Create changeset

```bash
pnpm changeset
```

Select:

- Packages: `@kitajs/html`, `@kitajs/fastify-html-plugin`
- Bump for `@kitajs/html`: `major` (breaking change)
- Bump for `@kitajs/fastify-html-plugin`: `patch` (internal update)
- Summary: `Remove deprecated Html.contentsToString function`

### Step 7: Commit and push

```bash
git add .
git commit -m "feat!: remove deprecated Html.contentsToString"
git push
```

---

## Example 5: Iterative Development with Frequent Testing

**Scenario**: Add three related helper functions to @kitajs/html.

### Iteration 1: First helper function

1. Implement `escapeJson()`
2. Add tests for `escapeJson()`
3. Run package-specific validation:
   ```bash
   pnpm -F @kitajs/html build
   pnpm -F @kitajs/html test
   ```
4. Fix any issues immediately

### Iteration 2: Second helper function

1. Implement `escapeStyle()`
2. Add tests for `escapeStyle()`
3. Run package-specific validation:
   ```bash
   pnpm -F @kitajs/html build
   pnpm -F @kitajs/html test
   ```
4. Fix any issues immediately

### Iteration 3: Third helper function

1. Implement `escapeScript()`
2. Add tests for `escapeScript()`
3. Run package-specific validation:
   ```bash
   pnpm -F @kitajs/html build
   pnpm -F @kitajs/html test
   ```
4. Fix any issues immediately

### Final steps

1. Update documentation for all three functions
2. Run pre-push validation:
   ```bash
   pnpm format
   pnpm build
   pnpm test-types
   pnpm test
   ```
3. Create changeset:

   ```bash
   pnpm changeset
   ```

   - Package: `@kitajs/html`
   - Bump: `minor`
   - Summary: `Add escapeJson, escapeStyle, and escapeScript helpers`

4. Commit and push

**Why this approach works**: Each iteration produces working, tested code. If an issue
appears, you know exactly which change caused it. Contrast with implementing all three
functions first and then testing — if tests fail, you have to debug three functions at
once.

---

## Example 6: When Root-level Tests Catch Issues

**Scenario**: Package-level tests pass, but root-level tests reveal integration issues.

### Step 1: Package tests pass

```bash
pnpm -F @kitajs/html test
# ✓ All tests pass
```

### Step 2: Root-level tests fail

```bash
pnpm test
# ✗ @kitajs/fastify-html-plugin tests fail
```

### Step 3: Investigate

The failure is in `@kitajs/fastify-html-plugin`, which depends on your changes in
`@kitajs/html`. The new behavior broke integration.

### Step 4: Fix the integration

Update `@kitajs/fastify-html-plugin` to work with the new behavior.

```bash
pnpm -F @kitajs/fastify-html-plugin build
pnpm -F @kitajs/fastify-html-plugin test
```

### Step 5: Verify all tests

```bash
pnpm test
# ✓ All tests pass
```

### Step 6: Update changeset

```bash
pnpm changeset
```

Now select both packages:

- `@kitajs/html`: `minor` (new feature)
- `@kitajs/fastify-html-plugin`: `patch` (compatibility fix)

**Lesson**: Always run root-level validation before pushing. Package-level tests catch
most issues, but cross-package integration problems only appear in full builds.
