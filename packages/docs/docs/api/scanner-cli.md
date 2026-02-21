# CLI Scanner

The `xss-scan` command-line tool runs the XSS analysis engine against an entire project or
specific files.

## Command

```
xss-scan [options] [files...]
```

When called without file arguments, scans all files included by the project's
`tsconfig.json`. When file paths are provided, only those files are analyzed.

## Options

| Flag                   | Description                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| `--cwd <path>`         | Working directory. Defaults to current directory.                              |
| `-p, --project <path>` | Path to `tsconfig.json`. Defaults to `tsconfig.json` in the working directory. |
| `-s, --simplified`     | Compact single-line diagnostic output.                                         |
| `--version`            | Print version and exit.                                                        |

## Exit codes

| Code | Meaning                          |
| ---- | -------------------------------- |
| 0    | No issues found.                 |
| 1    | Errors found (K601, K602, K603). |
| 2    | Warnings only (K604).            |

## How it works

The CLI creates a TypeScript program from the specified `tsconfig.json`, loads all source
files, and runs the same analysis engine used by the editor plugin. Diagnostics are
printed to the terminal with colored output. The process exits with the appropriate code
for CI gate integration.
