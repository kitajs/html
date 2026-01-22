# @kitajs/ts-html-plugin - Developer Guide

## Overview

`@kitajs/ts-html-plugin` is a TypeScript Language Service Plugin and CLI tool that detects
XSS vulnerabilities in JSX code at compile time. It integrates with your editor's
TypeScript service to show real-time warnings and errors for potentially unsafe HTML
content.

## Architecture

### Dual Mode Operation

The plugin operates in two modes:

1. **LSP Mode**: As a TypeScript Language Service Plugin, providing real-time diagnostics
   in editors
2. **CLI Mode**: As a standalone `xss-scan` command for CI/CD pipelines

### File Structure

```
src/
├── index.ts    # TypeScript Language Service Plugin entry point
├── cli.ts      # CLI tool implementation (xss-scan)
├── util.ts     # Core XSS detection logic and helpers
└── errors.ts   # Error code definitions (K601-K604)
```

### Key Components

#### `index.ts` - Language Service Plugin

The plugin entry point that hooks into TypeScript's language service:

```typescript
module.exports = function (modules: { typescript: typeof TS }) {
  return {
    create(info: server.PluginCreateInfo) {
      const proxy = proxyObject(info.languageService);

      proxy.getSemanticDiagnostics = function (filename) {
        const diagnostics = info.languageService.getSemanticDiagnostics(filename);

        // Only process .tsx/.jsx files
        if (!filename.endsWith('.tsx') && !filename.endsWith('.jsx')) {
          return diagnostics;
        }

        // Walk the AST and add XSS diagnostics
        ts.forEachChild(source, (node) => {
          recursiveDiagnoseJsxElements(ts, node, typeChecker, diagnostics);
        });

        return diagnostics;
      };

      return proxy;
    }
  };
};
```

#### `cli.ts` - XSS Scanner CLI

Standalone command-line tool for scanning projects:

- Parses `tsconfig.json` to get compiler options and file list
- Creates a TypeScript program
- Runs the same XSS detection logic as the LSP
- Outputs colored diagnostics
- Exit codes: 0 (clean), 1 (errors), 2 (warnings only)

#### `util.ts` - Detection Logic

Core XSS detection algorithms:

**`recursiveDiagnoseJsxElements`**: Entry point for JSX tree traversal

- Walks the AST depth-first
- Calls `diagnoseJsxElement` for each JSX node
- Deduplicates diagnostics by position

**`diagnoseJsxElement`**: Analyzes a single JSX element

- Checks for `script` tags (always allowed)
- Handles `safe` attribute logic (K602 double escape, K604 unused safe)
- Iterates through JSX expressions in children

**`diagnoseExpression`**: Analyzes expressions within JSX

- Unwraps parentheses and handles nested JSX
- Recurses through ternary/binary expressions
- Checks type safety with `isSafeAttribute`

**`isSafeAttribute`**: The core safety check

- Returns `true` if the type is safe to render unescaped
- Safe types: numbers, booleans, literals, `JSX.Element`, `Html.Children`
- Unsafe types: `string`, `any`, objects with `toString()`
- Special cases: `safe`-prefixed variables, `escapeHtml()` calls

#### `errors.ts` - Error Definitions

Four error codes with documentation links:

| Code | Severity | Description                                           |
| ---- | -------- | ----------------------------------------------------- |
| K601 | Error    | XSS-prone content without `safe` attribute            |
| K602 | Error    | Double escaping detected (safe + inner JSX)           |
| K603 | Error    | XSS in component children (needs `Html.escapeHtml()`) |
| K604 | Warning  | Unnecessary `safe` attribute on safe content          |

## Detection Algorithm

### What Makes Content "Safe"?

```typescript
function isSafeAttribute(ts, type, checker, node): boolean {
  // 1. `children` prop from PropsWithChildren - always safe
  if (node.name?.text === 'children') return true;

  // 2. Variables initialized with JSX - safe
  if (decl.initializer && isJsx(ts, decl.initializer)) return true;

  // 3. `any` type - NEVER safe
  if (type.flags & ts.TypeFlags.Any) return false;

  // 4. JSX.Element alias - safe
  if (type.aliasSymbol?.escapedName === 'Element') return true;

  // 5. Html.Children alias - safe
  if (type.aliasSymbol?.escapedName === 'Children') return true;

  // 6. Union types - all members must be safe
  if (type.isUnionOrIntersection()) {
    return type.types.every((t) => isSafeAttribute(ts, t, checker, node));
  }

  // 7. Non-string primitives (number, boolean, etc.) - safe
  if (!(type.flags & ts.TypeFlags.String)) return true;

  // 8. Variables starting with "safe" - suppressed
  if (text.startsWith('safe')) return true;

  // 9. escapeHtml() calls - safe
  if (text.match(/^(\w+\.)?(escapeHtml|e`|escape)/i)) return true;

  return false;
}
```

### Expression Handling

Binary and ternary expressions are analyzed on both branches:

```typescript
// Both sides are checked, even if one never executes
<div>{condition ? safeValue : unsafeValue}</div>
//                            ^^^^^^^^^^^ Error!

// Boolean operators are ignored (result is boolean)
<div>{a === b}</div>  // OK
```

### Component vs Element Detection

The plugin distinguishes between native elements and components:

```typescript
// Native element - use `safe` attribute
<div>{ userInput } <
  /div>  / / K601 <
  // Component - use Html.escapeHtml()
  Component >
  { userInput } <
  /Component>  / / K603;
```

Detection is based on tag name casing (uppercase = component).

## Development

### Building

```bash
pnpm build  # Compiles TypeScript with tsgo
```

### Testing

```bash
pnpm test  # Runs vitest with coverage and type checking
```

The tests use the `KITA_TS_HTML_PLUGIN_TESTING` environment variable to enable special
handling for monorepo paths.

### Running the CLI

```bash
# After building
node dist/cli.js --help
node dist/cli.js  # Scan current project
node dist/cli.js src/file.tsx  # Scan specific files
```

## Integration

### Editor Setup

```json
// tsconfig.json
{
  "compilerOptions": {
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
  }
}
```

```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### CI/CD Integration

```json
// package.json
{
  "scripts": {
    "test": "xss-scan && vitest"
  }
}
```

## Key Patterns

### Proxy Pattern for Language Service

The plugin wraps the original language service methods:

```typescript
export function proxyObject<T extends object>(obj: T): T {
  const proxy: T = Object.create(null);
  for (const k of Object.keys(obj) as Array<keyof T>) {
    const x = obj[k]!;
    proxy[k] = (...args) => x.apply(obj, args);
  }
  return proxy;
}
```

### Diagnostic Creation

```typescript
function diagnostic(node, error, category): ts.Diagnostic {
  return {
    category: ts.DiagnosticCategory[category],
    messageText: Errors[error].message,
    code: Errors[error].code,
    file: node.getSourceFile(),
    length: node.getWidth(),
    start: node.getStart()
  };
}
```

## Suppression Techniques

Users can suppress warnings in several ways:

1. **`safe` attribute**: `<div safe>{content}</div>`
2. **`safe`-prefixed variable**: `const safeContent = content;`
3. **Cast to 'safe'**: `{content as 'safe'}`
4. **escapeHtml call**: `{Html.escapeHtml(content)}`

## Common Gotchas

1. **Script tags are exempt**: Content inside `<script>` is intentionally executable
2. **Both ternary branches checked**: Even "impossible" branches are analyzed
3. **`any` type is never safe**: Strict types help XSS detection
4. **Components need `Html.escapeHtml()`**: The `safe` attribute only works on native
   elements
