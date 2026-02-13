# XSS Scanner

The `@kitajs/ts-html-plugin` is both a TypeScript Language Service Plugin **and** a CLI
tool for finding XSS vulnerabilities in your TypeScript code.

## How It Works

The plugin analyzes your JSX code at compile-time and warns you about potential XSS
vulnerabilities. It integrates with your code editor to show real-time diagnostics and can
also be run as a CLI tool in your CI/CD pipeline.

## CLI Usage

The `xss-scan` command scans your entire project for XSS vulnerabilities:

```bash
$ xss-scan --help

ts-html-plugin v1.3.1 - A CLI tool & TypeScript LSP for finding XSS vulnerabilities in your TypeScript code.

Usage: xss-scan         [options] <file> <file>...
       ts-html-plugin   [options] <file> <file>...

Options:
  --cwd <path>          The current working directory to use (defaults to process.cwd())
  -p, --project <path>  The path to the tsconfig.json file to use (defaults to 'tsconfig.json')
  -s, --simplified      Use simplified diagnostics
  -h, --help            Show this help message
  --version             Show the version number
  <file> <file>...      The files to check (defaults to all files in tsconfig.json)

Examples:
  $ xss-scan
  $ xss-scan --cwd src
  $ xss-scan --project tsconfig.build.json
  $ xss-scan src/index.tsx src/App.tsx

Exit codes:
  0 - No XSS vulnerabilities were found
  1 - XSS vulnerabilities were found
  2 - Only warnings were found
```

## Error Codes

The plugin reports four different error codes:

### K601: XSS-prone content without safe attribute

Usage of JSX expression without safe attribute. This could lead to XSS vulnerabilities.

```tsx
// ❌ Content variable may have malicious scripts
const html = <div>{content}</div>;

// ✅ Content is escaped with safe attribute
const html = <div safe>{content}</div>;

// ⚠️ Variable starts with "safe", error suppressed
const safeContent = content;
const html = <div>{safeContent}</div>;
```

### K602: Double escaping detected

Usage of safe attribute on a JSX element whose children contains other JSX elements. It
will lead to double escaping.

```tsx
// ❌ Safe attribute will also escape inner elements
// Results in: <a>&lt;b&gt;1&lt;/b&gt;</a>
const html = (
  <a safe>
    <b>1</b>
  </a>
);

// ✅ Safe attribute only on inner element
// Results in: <a><b>1</b></a>
const html = (
  <a>
    <b safe>1</b>
  </a>
);
```

### K603: XSS in component children

You are using a xss-prone element as children of a component. Wrap it in
`Html.escapeHtml()` or prepend variable with `safe`.

```tsx
// ❌ Content may have malicious scripts
const html = <Component>{content}</Component>;

// ✅ Content is manually escaped
const html = <Component>{Html.escapeHtml(content)}</Component>;

// ⚠️ Variable starts with "safe", error suppressed
const safeContent = content;
const html = <Component>{safeContent}</Component>;
```

### K604: Unnecessary safe attribute

You are using the safe attribute on expressions that do not contain any XSS
vulnerabilities. Remove the safe attribute or prepend your variable with `unsafe`.

```tsx
// ⚠️ Numbers never have XSS content
const html = <div safe>{numberVariable}</div>;

// ✅ No safe attribute needed for numbers
const html = <div>{numberVariable}</div>;

// ✅ Variable prefixed with "unsafe" to force safe attribute
const unsafeVariable = numberVariable;
const html = <div safe>{unsafeVariable}</div>;
```

## Handling Warnings

Sometimes, the plugin may not detect that a string or variable is safe and may emit
warnings, even when you are confident there are no security issues. Here are ways to
address this:

### 1. Use the `safe` Attribute

Even if you are certain the content is free from XSS vulnerabilities, you can still use
the `safe` attribute:

```tsx
const html = <div safe>{content}</div>;
```

### 2. Prepend Variable with `safe`

Indicate to the plugin that you are confident the variable is safe:

```tsx
const safeContent = '';
const html = <div>{safeContent}</div>;
```

### 3. Cast to `'safe'`

When using raw values or function calls, append `as 'safe'`:

```tsx
const html = <div>{content as 'safe'}</div>;
```

## Special Cases

1. **Script tags are exempt**: Content inside `<script>` tags is allowed as it's meant to
   be executable:

```tsx
const html = <script>{content}</script>;
```

2. **Ternary operations**: Both branches are evaluated separately:

```tsx
const html = <div>{true ? safeContent : content}</div>;
//                                      ~~~~~~~
// Error: unsafe content in false branch
```

## CI/CD Integration

Add `xss-scan` to your test script to catch XSS vulnerabilities in your CI/CD pipeline:

```json
{
  "scripts": {
    "test": "xss-scan && vitest",
    "ci": "xss-scan && npm run build && npm test"
  }
}
```

This ensures no XSS vulnerabilities make it to production.
