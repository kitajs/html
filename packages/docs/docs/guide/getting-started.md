# Getting Started

To use the `@kitajs/html` package, follow these steps:

:::danger XSS Warning The Kita/Html template engine can introduce **XSS vulnerabilities**
if not set up properly.

Please strictly follow the instructions below to ensure your project is secure. :::

## Installation

Install the required npm packages: `@kitajs/html` and `@kitajs/ts-html-plugin`.

Open your terminal and run:

:::code-group

```bash [pnpm]
pnpm add @kitajs/html @kitajs/ts-html-plugin
```

```bash [npm]
npm install @kitajs/html @kitajs/ts-html-plugin
```

```bash [yarn]
yarn add @kitajs/html @kitajs/ts-html-plugin
```

```bash [bun]
bun add @kitajs/html @kitajs/ts-html-plugin
```

:::

## TypeScript Configuration

Configure your TypeScript project to transpile TSX/JSX into JavaScript and use our LSP
Plugin for XSS detection.

Update your `tsconfig.json` file with the following settings:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@kitajs/html",
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
  }
}
```

## Editor IntelliSense

You will only have XSS intellisense if your editor uses the TypeScript version from your
project's `node_modules` instead of the globally installed version.

![XSS detection example](https://kitajs.org/xss-preview.png)

### VS Code

For Visual Studio Code, configure this in your workspace settings:

```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## XSS Scanner CLI

Besides having an in-editor experience to detect XSS vulnerabilities, you **MUST** also
run the xss scanner tool in your CI/CD or testing environment.

Add the `xss-scan` command to your `package.json`:

```json
{
  "scripts": {
    "test": "xss-scan && vitest"
  }
}
```

This CLI comes from `@kitajs/ts-html-plugin`, which catches XSS vulnerabilities that may
be introduced into your codebase, automating the xss scanning process to run every time
you test your code.

Learn more about the [XSS Scanner CLI](/guide/xss-protection/scanner).

## Verify Your Setup

After setting everything up, copy the below **xss-prone** code snippet and paste it into
your project to ensure the xss scanner is working correctly.

```tsx
const text: string = 'I can have <script>alert("XSS")</script> injected';
const html = <div>{text}</div>;
```

The above code should trigger an error in your editor. If not, please set up the
[IntelliSense](#editor-intellisense) section again.

Also run `xss-scan` to ensure the CLI is working correctly. If not, please open an issue
on our [GitHub repository](https://github.com/kitajs/html).

If you have any questions or need help, please reach out to us on our
[Discord](https://kitajs.org/discord) server.

## Next Steps

After installing the `@kitajs/html` package and configuring your TypeScript project, you
should be able to use JSX to generate HTML inside your .tsx files.

```tsx
const html = (
  <div>
    <h1>Hello, world!</h1>
    <p>Welcome to the KitaJS HTML package.</p>
  </div>
);

console.log(html);
// <div><h1>Hello, world!</h1><p>Welcome to the KitaJS HTML package.</p></div>
```

**Next, you can:**

- Learn about [XSS & Sanitization](/guide/xss-protection/sanitization)
- Explore [JSX Syntax](/guide/features/jsx-syntax) features
- Try [Async Components](/guide/features/async-components)
- Integrate with [Fastify](/integrations/frameworks/fastify)
- Use with [HTMX](/integrations/libraries/htmx)
