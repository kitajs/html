# Kita Plugin for Rspress

An Rspress plugin that renders Kita HTML code blocks and displays the formatted HTML
output with syntax highlighting.

## Features

- **Build-time rendering**: Executes Kita JSX code during the build process
- **HTML output display**: Adds a button to show/hide the rendered HTML
- **Syntax highlighting**: Uses Shiki to highlight the HTML output with the same theme as
  code blocks
- **Formatting**: Automatically formats HTML output with Prettier

## Usage

### 1. Plugin Setup

The plugin is already configured in `rspress.config.ts`:

```typescript
import { remarkKitaPlugin } from './plugins/kita/remarkPlugin'

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkKitaPlugin]
  }
})
```

### 2. Code Block Syntax

Use the `kita` meta tag with `tsx` or `jsx` code blocks:

````markdown
```tsx kita
const name = 'World'
const html = <div class="greeting">Hello, {name}!</div>
```
````

**Important**: By default, your code must include a variable named `html` that contains
the rendered output.

#### Custom Variable Names

You can specify a custom variable name using `kita=variableName`:

````markdown
```tsx kita=output
const name = 'World'
const output = <div class="greeting">Hello, {name}!</div>
```
````

### 3. Twoslash Support

You can combine `kita` with `twoslash` for type checking and annotations:

````markdown
```tsx twoslash kita
//@errors: 88604
const count = 42
// ---cut---
const html = <span>{count}</span>
```
````

The full code (including all twoslash annotations and comments) will be displayed to
users, and the code will execute properly to generate the HTML output.

### 4. Examples

#### Simple Example

````markdown
```tsx kita
const html = <div>Hello World</div>
```
````

#### Component Example

````markdown
```tsx kita
function Card({ title }: { title: string }) {
  return (
    <div class="card">
      <h2 safe>{title}</h2>
    </div>
  )
}

const html = <Card title="Welcome" />
```
````

#### Async Example

````markdown
```tsx kita
async function UserGreeting({ userId }: { userId: string }) {
  return <div>User {userId}</div>
}

const html = await UserGreeting({ userId: '123' })
```
````

#### Custom Variable Name Example

````markdown
```tsx kita=result
function Badge({ label }: { label: string }) {
  return <span class="badge">{label}</span>
}

const result = <Badge label="New" />
```
````

## Architecture

### Files

- **`remarkPlugin.ts`**: Remark plugin that processes code blocks and wraps them with
  `KitaCodeBlock`
- **`renderer.ts`**: Executes Kita JSX code in a VM sandbox and extracts the `html`
  variable
- **`highlighter.ts`**: Syntax highlights HTML output using Shiki with CSS variables theme
- **`../../theme/components/KitaCodeBlock.tsx`**: React component that adds the toggle
  button and renders the expandable HTML output
- **`../../theme/components/KitaCodeBlock.module.scss`**: Component styles matching
  Rspress preview plugin pattern

### How It Works

1. **Parse**: The remark plugin visits all code blocks with the `kita` or `kita=varname`
   meta tag and extracts the variable name
2. **Render**: Each block is transpiled from TSX to JavaScript using TypeScript compiler
3. **Execute**: Code runs in a Node.js VM sandbox with `@kitajs/html` available
4. **Extract**: The output variable (default: `html`, or custom via `kita=varname`) is
   extracted from the VM context
5. **Format**: HTML is formatted with Prettier (80 char width, 2 space indent)
6. **Highlight**: HTML is syntax highlighted with Shiki using CSS variables theme
7. **Transform**: The code block node is mutated in-place to become a `<KitaCodeBlock>`
   wrapper with the highlighted HTML passed as props
8. **Import**: An MDX import statement for `KitaCodeBlock` is prepended to the document
9. **Render**: The React component adds a Kita logo button to the code block's button
   group and renders the expandable HTML output below
10. **Display**: Users click the button to toggle the HTML output with CSS Grid animation

## Limitations

- Code must define a variable named `html` (or a custom name specified with
  `kita=varname`)
- Code is executed at build time in a sandboxed environment
- Async code is supported but must be awaited
- External imports are not supported (only `@kitajs/html`)
