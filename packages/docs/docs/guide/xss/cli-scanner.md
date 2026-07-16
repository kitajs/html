---
description:
  Configure editor-time XSS diagnostics, run xss-scan from the command line, interpret
  exit codes, and integrate the CLI scanner into CI.
---

# CLI Scanner

Kita Html catches unsafe JSX before production through two tools from
`@kitajs/ts-html-plugin`: a TypeScript editor plugin for real-time diagnostics and the
`xss-scan` CLI for project-wide checks in CI.

Both tools report the same TS88601 through TS88604 diagnostics. The editor plugin catches
issues while you type. The CLI catches changes from developers without the plugin enabled,
or type changes that make a previously safe expression unsafe.

## Editor diagnostics

Add the TypeScript plugin to `tsconfig.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
  }
}
```

Your editor must use the project's local TypeScript installation. In VS Code, set
`js/ts.tsdk.path` to `node_modules/typescript/lib` and enable
`js/ts.tsdk.promptToUseWorkspaceVersion`.

The plugin works in editors that support TypeScript language service plugins, including VS
Code, Neovim with `nvim-lspconfig`, and JetBrains IDEs. It does not work with `tsgo`,
which does not run TypeScript language service plugins. Build-time compilation with `tsgo`
is unaffected.

## CLI usage

```bash
xss-scan [options] [files...]
```

The command can also be invoked as `ts-html-plugin`, which is an alias for the same CLI.

When called without file arguments, it scans all files included by the project's
`tsconfig.json`. When file paths are provided, only those files are analyzed.

```bash title="Scan the project"
xss-scan
```

```bash title="Scan specific files"
xss-scan src/pages/login.tsx src/pages/profile.tsx
```

Options:

| Flag                   | Description                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| `--cwd <path>`         | Working directory. Defaults to current directory.                              |
| `-p, --project <path>` | Path to `tsconfig.json`. Defaults to `tsconfig.json` in the working directory. |
| `-s, --simplified`     | Compact single-line diagnostic output.                                         |
| `--version`            | Print version and exit.                                                        |

Exit codes:

| Code | Meaning                                   |
| ---- | ----------------------------------------- |
| 0    | No issues found.                          |
| 1    | Errors found (TS88601, TS88602, TS88603). |
| 2    | Warnings only (TS88604).                  |

## CI integration

Add the scanner to your test script so it runs before or alongside your test suite.

```json title="package.json"
{
  "scripts": {
    "test": "xss-scan && vitest"
  }
}
```

In GitHub Actions, run the scanner after installing dependencies:

```yaml title=".github/workflows/ci.yml"
- name: XSS scan
  run: npx xss-scan
```
