# Running the XSS Scanner

The `xss-scan` CLI ships with `@kitajs/ts-html-plugin` and performs project-wide XSS
analysis from the command line.

## Usage

```bash
xss-scan [options] [files...]
```

The command can also be invoked as `ts-html-plugin`, which is an alias for the same CLI.

When called without file arguments, it scans all files included by the project's
`tsconfig.json`. When file paths are provided, only those files are analyzed.

```bash
# Scan entire project
xss-scan

# Scan specific files
xss-scan src/pages/login.tsx src/pages/profile.tsx
```

## Options

`--cwd <path>` sets the working directory. Defaults to the current directory.

`-p, --project <path>` specifies the path to `tsconfig.json`. Defaults to `tsconfig.json`
in the working directory.

`-s, --simplified` outputs diagnostics in a compact single-line format, useful for machine
parsing.

## Exit codes

The scanner exits with code 0 when no issues are found, 1 when errors are present, and 2
when only warnings exist. This makes it suitable for CI gates where you want to fail on
errors but optionally allow warnings.

## Integration

Add the scanner to your test script so it runs before or alongside your test suite.

```json
{
  "scripts": {
    "test": "xss-scan && vitest"
  }
}
```

In a GitHub Actions workflow:

```yaml
- name: XSS scan
  run: npx xss-scan
```

The scanner uses the same TypeScript program and analysis engine as the editor plugin, so
findings are identical between the two.
