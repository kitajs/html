---
description:
  Deprecated TypeScript 5 and 6 XSS tooling. Configure the @kitajs/ts-html-plugin editor
  plugin, run xss-scan, and migrate to kita-html check.
---

# Editor plugin and xss-scan

:::warning Deprecated

`@kitajs/ts-html-plugin` only works with TypeScript 5 and 6. TypeScript 7 removed the
compiler API and language service plugins it depends on. Upgrade to TypeScript 7.1 and use
[`kita-html check`](./cli-scanner.mdx) instead. This package only receives security fixes.

:::

`@kitajs/ts-html-plugin` provides a TypeScript editor plugin for real-time diagnostics and
the `xss-scan` CLI for project-wide checks. Both report the same TS88601 through TS88604
diagnostics as `kita-html check`.

## Editor diagnostics

Add the TypeScript plugin to `tsconfig.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
  }
}
```

Your editor must use the project's local TypeScript 5 or 6 installation. In VS Code, set
`js/ts.tsdk.path` to `node_modules/typescript/lib` and enable
`js/ts.tsdk.promptToUseWorkspaceVersion`.

The plugin works in editors that support TypeScript language service plugins, including VS
Code, Neovim with `nvim-lspconfig`, and JetBrains IDEs. It does not load in editors
running TypeScript 7 or `tsgo`.

## CLI usage

```bash
xss-scan [options] [files...]
```

The command can also be invoked as `ts-html-plugin`. Without file arguments, it scans all
files included by the project's `tsconfig.json`. When file paths are provided, the scan
starts from those files and includes any TSX/JSX files they import. On TypeScript 7,
`xss-scan` exits with `1` and points to `kita-html check`.

| Flag                   | Description                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `--cwd <path>`         | Base directory for file paths in the summary output. Defaults to the current directory. |
| `-p, --project <path>` | Path to `tsconfig.json`. Defaults to `tsconfig.json` in the current directory.          |
| `-s, --simplified`     | Compact single-line diagnostic output, in the same format as `tsc`.                     |
| `--version`            | Print version and exit.                                                                 |
| `-h, --help`           | Print help and exit.                                                                    |

`xss-scan` exits with `0` when no issues are found, `1` on errors or invalid input, and
`2` when only TS88604 warnings remain.

## Migrating to kita-html check

Upgrade `typescript` to 7.1 or later, install `@kitajs/html-cli`, and replace `xss-scan`
with `kita-html check` in scripts and CI. The exit codes are the same. Remove the
`plugins` entry from `tsconfig.json` and the `js/ts.tsdk` settings, which TypeScript 7
does not use. `--simplified` maps to `--format tsc`, and `--format github` adds pull
request annotations.
