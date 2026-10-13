# XSS and tooling

Use this before writing or reviewing any Kita JSX that includes dynamic strings.

Latest docs:

- Safe attribute: `https://html.kitajs.org/guide/xss/safe-attribute.md`
- kita-html check: `https://html.kitajs.org/guide/xss/cli-scanner.md`
- Output formats: `https://html.kitajs.org/guide/xss/cli-output-formats.md`
- Deprecated TypeScript 5/6 plugin: `https://html.kitajs.org/guide/xss/ts-html-plugin.md`
- Error codes: `https://html.kitajs.org/guide/xss/error-codes.md`

If this file and the docs disagree, trust the docs.

## Main warning

Dynamic strings are unsafe by default. Kita does not auto-escape JSX children because JSX
output is already plain strings. Safety comes from the `safe` attribute, explicit escaping
helpers, and `kita-html check` in CI (TypeScript 7.1+).

## Correct escaping patterns

### Native element children

Use `safe` on the nearest native element containing the untrusted value.

```tsx
function UserCard({ name, bio }: { name: string; bio: string }) {
  return (
    <div class="card">
      <h2 safe>{name}</h2>
      <p safe>{bio}</p>
    </div>
  )
}
```

### Component children

`safe` does not solve unsafe component children by itself.

Use one of these instead:

```tsx
import { Fragment, escapeHtml } from '@kitajs/html'

<Card>
  <Fragment safe>{userInput}</Fragment>
</Card>

<Card>{escapeHtml(userInput)}</Card>
```

## Mistakes to avoid

1. Do not wrap a large parent in `safe` if it also contains nested JSX or component
   output. That causes double escaping.
2. Do not pass raw `string` children into components that render them later.
3. Do not use naming suppressions like `safeContent` unless the value is known to be safe.

## Setup snippets

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@kitajs/html"
  }
}
```

Install `@kitajs/html-cli` and `typescript` 7.1 or later as dev dependencies. TypeScript 7
does not load editor plugins, so do not add a `plugins` entry. Projects stuck on
TypeScript 5 or 6 use the deprecated `@kitajs/ts-html-plugin` and `xss-scan` instead.

### `package.json` scripts

```json
{
  "scripts": {
    "test": "kita-html check && vitest"
  }
}
```

## Error-code reminders

- TS88601: unsafe child on a native element
- TS88602: double-escape pattern caused by `safe`
- TS88603: unsafe child passed to a component
- TS88604: redundant `safe`

If you are generating a fix, choose the narrowest change that preserves intended HTML
output.

After a batch of changes, prefer running `pnpm kita-html check` directly when the project
has the dependency installed. Use `--format tsc` for one line per finding.
