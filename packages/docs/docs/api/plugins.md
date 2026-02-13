# TypeScript Plugin

The `@kitajs/ts-html-plugin` is both a **TypeScript Language Service Plugin** and a **CLI
tool** for detecting XSS vulnerabilities.

## Installation

```bash
npm install @kitajs/ts-html-plugin
```

## TypeScript Configuration

Enable the plugin in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
  }
}
```

## How It Works

The plugin hooks into TypeScript's language service to analyze JSX expressions in
real-time:

1. **Parse JSX** - Identifies all JSX elements in your code
2. **Type analysis** - Determines if children are safe or unsafe
3. **Report issues** - Emits diagnostics for unsafe usage
4. **Suggest fixes** - Provides quick-fixes to add `safe` attribute

## Error Codes

### K601: XSS-prone content without safe attribute

Triggered when potentially unsafe content is used without the `safe` attribute.

```tsx
const userInput: string = req.body.comment;

// ❌ Error K601
<div>{userInput}</div>

// ✅ Fixed
<div safe>{userInput}</div>
```

### K602: Double escaping detected

Triggered when `safe` is used on an element containing other JSX elements.

```tsx
// ❌ Error K602 - Will double-escape
<a safe>
  <b>Text</b>
</a>

// ✅ Fixed - Only escape the text
<a>
  <b safe>Text</b>
</a>
```

### K603: XSS in component children

Triggered when unsafe content is passed to a component.

```tsx
// ❌ Error K603
<Component>{userInput}</Component>

// ✅ Fixed - Manual escape
<Component>{Html.escapeHtml(userInput)}</Component>

// ✅ Fixed - Prefix variable
const safeInput = userInput;
<Component>{safeInput}</Component>
```

### K604: Unnecessary safe attribute

Triggered when `safe` is used on content that's already safe.

```tsx
// ⚠️ Warning K604 - Number is always safe
<div safe>{count}</div>

// ✅ Fixed - Remove safe
<div>{count}</div>
```

## CLI Tool

The `xss-scan` command scans your entire project:

```bash
$ xss-scan

ts-html-plugin v1.3.1

✓ Scanned 45 files
✗ Found 2 XSS vulnerabilities in 2 files

src/components/User.tsx:12:10 - error K601
  Usage of JSX expression without safe attribute.

src/pages/Profile.tsx:25:15 - error K602
  Double escaping detected with safe attribute.
```

**Options:**

```bash
xss-scan [options] <file> <file>...

Options:
  --cwd <path>          Working directory (default: process.cwd())
  -p, --project <path>  Path to tsconfig.json (default: 'tsconfig.json')
  -s, --simplified      Simplified diagnostics
  -h, --help            Show help
  --version             Show version

Examples:
  $ xss-scan                          # Scan all files
  $ xss-scan src/                     # Scan directory
  $ xss-scan src/App.tsx              # Scan specific file
  $ xss-scan -p tsconfig.build.json   # Use specific tsconfig

Exit codes:
  0 - No issues found
  1 - XSS vulnerabilities found
  2 - Only warnings found
```

## Configuration

The plugin can be configured via tsconfig.json:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@kitajs/ts-html-plugin",
        "suppressions": {
          "K604": true // Suppress unnecessary safe warnings
        }
      }
    ]
  }
}
```

## Type Detection

The plugin understands TypeScript types to determine safety:

### Always Safe

- `number`, `bigint`, `boolean`
- `null`, `undefined`
- String literals: `"hello"`
- Template literals with no substitutions: `` `hello` ``
- `JSX.Element` (already rendered HTML)
- Variables prefixed with `safe`
- Results of `Html.escapeHtml()` calls

### Always Unsafe

- `string` type
- `any` type
- Variables prefixed with `unsafe`
- Object with `toString()` method

### Context-Dependent

- Template literals with substitutions
- Union types (all branches checked)
- Ternary expressions (both branches checked)

## Suppression Patterns

### 1. Prefix with `safe`

```tsx
const safeHtml = generateTrustedHtml();
<div>{safeHtml}</div>; // No error
```

### 2. Cast to `'safe'`

```tsx
<div>{getTrustedContent() as 'safe'}</div>
```

### 3. Use `escapeHtml()`

```tsx
<div>{Html.escapeHtml(userInput)}</div>
```

### 4. Script tags exempt

```tsx
// Script content is expected to be code
<script>{javascriptCode}</script>
```

## CI/CD Integration

Add to your test pipeline:

```json
{
  "scripts": {
    "test": "xss-scan && vitest",
    "lint": "eslint . && xss-scan",
    "ci": "xss-scan && npm run build && npm test"
  }
}
```

**GitHub Actions:**

```yaml
- name: XSS Scan
  run: npx xss-scan

- name: Run Tests
  run: npm test
```

## Next Steps

- [XSS Protection Overview](/guide/xss-protection/overview) - Learn about XSS
- [XSS Scanner](/guide/xss-protection/scanner) - Detailed scanner docs
- [Sanitization](/guide/xss-protection/sanitization) - Using the `safe` attribute
