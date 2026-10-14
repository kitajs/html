---
name: twoslash
description:
  TwoSlash annotations and options for TypeScript code blocks in documentation. Use when
  writing code blocks that should display type information, errors, completions, or
  emitted output.
user-invocable: false
---

# TwoSlash Code Blocks

TwoSlash enriches TypeScript code blocks with live type information from the compiler. Use
it whenever a code block benefits from showing inferred types, error messages,
completions, or emitted output.

Full references:

- Options:
  https://raw.githubusercontent.com/twoslashes/twoslash/refs/heads/main/docs/refs/options.md
- Notations:
  https://raw.githubusercontent.com/twoslashes/twoslash/refs/heads/main/docs/refs/notations.md

## Enabling TwoSlash

Add `twoslash` after the language identifier on the opening fence:

````
```ts twoslash
const greeting = 'Hello'
//    ^?
```
````

## Query Notations

### `^?` — Extract Type

Places the inferred type of the identifier above the caret inline in the rendered output.
The caret must align with the first character of the identifier.

````
```ts twoslash
const hi = 'Hello'
const msg = `${hi}, world`
//    ^?
```
````

### `^|` — Completions

Shows auto-complete suggestions at the caret position. Use `// @noErrors` alongside it
because the incomplete expression is not valid TypeScript.

````
```ts twoslash
// @noErrors
console.e
//       ^|
```
````

Up to 5 completions are shown. Deprecated completions are rendered as such.

### `^^^` — Highlight Range

Highlights a span of the line above the carets. The number of `^` characters sets the
width of the highlight. Rendering depends on the integration (typically adds a
`.twoslash-highlighted` class).

````
```ts twoslash
function add(a: number, b: number) {
  //     ^^^
  return a + b
}
```
````

## Cutting Code

TwoSlash requires each sample to be a complete TypeScript program. Use cut markers to hide
setup code from the reader while keeping it available to the compiler.

### `// ---cut---` / `// ---cut-before---`

Everything above this line is hidden from output. The compiler still processes it, so type
information from hidden code is available below.

````
```ts twoslash
const level: string = 'Danger'
// ---cut---
console.log(level)
```
````

### `// ---cut-after---`

Hides everything below this line from output.

````
```ts twoslash
const level: string = 'Danger'
// ---cut-before---
console.log(level)
// ---cut-after---
console.log('This is not shown')
```
````

### `// ---cut-start---` and `// ---cut-end---`

Removes a section of code between the two markers. Multiple pairs are supported.

````
```ts twoslash
const level: string = 'Danger'
// ---cut-start---
console.log(level) // hidden
// ---cut-end---
console.log('This is shown')
```
````

## Overriding Options

Use `// @name` or `// @name: value` to override compiler options or handbook options.
These lines are removed from the rendered output.

````
```ts twoslash
// @target: esnext
// @noImplicitAny: false
const fn = a => a + 1
```
````

## Handbook Options

These are TwoSlash-specific directives, not TypeScript compiler flags.

| Option                            | Purpose                                                   | Example                         |
| --------------------------------- | --------------------------------------------------------- | ------------------------------- |
| `// @errors: 2322 2588`           | Declare expected TypeScript error codes. Space-separated. | Show errors intentionally       |
| `// @noErrors`                    | Suppress all errors (or specific codes).                  | Incomplete snippets             |
| `// @noErrorsCutted`              | Ignore errors in cut-away code.                           | Setup code with expected errors |
| `// @noErrorValidation`           | Render errors but do not throw if unexpected ones appear. | Exploratory samples             |
| `// @keepNotations`               | Keep all notation comments in the output untouched.       | Source map debugging            |
| `// @showEmit`                    | Replace output with the compiled `.js` file.              | Show emitted JavaScript         |
| `// @showEmittedFile: index.d.ts` | Show a specific emitted file (`.d.ts`, `.map`, etc.).     | Show type declarations          |

## Showing Emitted Files

`// @showEmit` replaces the code block contents with the TypeScript compiler output.

````
```ts twoslash
// @showEmit
const level: string = 'Danger'
```
````

To show a specific emitted file, pair `@showEmit` with `@showEmittedFile`:

````
```ts twoslash
// @declaration
// @showEmit
// @showEmittedFile: index.d.ts
export const hello = 'world'
```
````

## Multi-File Samples

Use `// @filename: [file]` to split a sample into multiple virtual files. This is the only
TwoSlash directive that is not removed from output (cut it away if not relevant).

````
```ts twoslash
// @filename: a.ts
export const helloWorld: string = 'Hi'
// ---cut---
// @filename: b.ts
import { helloWorld } from './a'

console.log(helloWorld)
```
````

## When to Use TwoSlash

Use TwoSlash when:

- Showing the inferred type of a variable or expression is essential for understanding
- Demonstrating a TypeScript error is the point of the example
- Showing compiler output (emitted JS or `.d.ts`) illustrates the concept

Do not use TwoSlash on:

- Config file blocks (`json`, `bash`, etc.)
- Code that cannot be made into a complete TypeScript program without excessive setup
- Blocks where type information adds no value to the reader
