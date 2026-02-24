# Editor Plugin

The TypeScript language service plugin provides real-time XSS diagnostics in editors that
support TypeScript plugins.

## Configuration

Add the plugin to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
  }
}
```

The editor must use the project's local TypeScript installation. In VS Code, set
`typescript.tsdk` to `node_modules/typescript/lib` and enable
`typescript.enablePromptUseWorkspaceTsdk`.

## How it works

The plugin wraps the TypeScript language service's `getSemanticDiagnostics` method. When a
`.tsx` or `.jsx` file is analyzed, the plugin runs the XSS analysis engine over the file's
AST and appends any findings to the standard TypeScript diagnostics.

Diagnostics appear as editor squiggles with error codes TS88601 through TS88604. Each
diagnostic includes a message describing the issue and the recommended fix.

## Supported editors

Any editor with TypeScript language service plugin support works, including VS Code,
Neovim with nvim-lspconfig, and JetBrains IDEs. The plugin communicates through the
standard TypeScript language service protocol.

## Limitations

The plugin does not work with `tsgo` (the native TypeScript compiler). It requires the
standard TypeScript language server. Build-time compilation with `tsgo` is unaffected
since the plugin only runs in the language service.
