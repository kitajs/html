# XSS And Tooling

Use this before writing or reviewing any Kita JSX that includes dynamic strings.

Latest docs:

- Doc link, safe attribute raw markdown:
  `https://html.kitajs.org/guide/xss/safe-attribute.md`
- Doc link, safety rules raw markdown: `https://html.kitajs.org/guide/xss/safety-rules.md`
- Doc link, scanner CLI raw markdown: `https://html.kitajs.org/guide/xss/scanner-cli.md`
- Doc link, error codes raw markdown: `https://html.kitajs.org/guide/xss/error-codes.md`

These doc links are the most up-to-date reference if this file and the docs ever diverge.

## Main warning

Dynamic strings are unsafe by default.

Kita does not auto-escape JSX children because JSX output is already just strings. Safety
comes from the `safe` attribute, explicit escaping helpers, the TypeScript plugin, and
`xss-scan` in CI.

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
3. Do not use naming suppressions like `safeContent` unless safety is genuinely
   guaranteed.

## Setup snippets

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@kitajs/html",
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
  }
}
```

### VS Code workspace settings

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### `package.json` scripts

```json
{
  "scripts": {
    "test": "xss-scan && vitest"
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

After a batch of changes, prefer running `pnpm xss-scan` directly when the project has the
dependency installed.
