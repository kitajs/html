# Style Examples

## Good: Direct, information-dense opening

```markdown
Kita Html is a JSX runtime where every element evaluates to a string. Where React's
`<div />` produces a virtual DOM node that must be reconciled and serialized, Kita Html's
`<div />` returns `'<div></div>'` directly.
```

## Bad: Filler, motivational, generic

```markdown
Welcome to Kita Html! 🚀 In this guide, we'll explore how this amazing library can help
you build faster web applications. Let's get started!
```

## Good: Short paragraphs, no unnecessary bullets

```markdown
The `safe` attribute escapes children at render time. Adding it to any native element
causes the runtime to pass all children through HTML entity escaping before concatenation.

A TypeScript language service plugin analyzes every JSX expression in your editor and
flags any child whose type could carry unescaped HTML.
```

## Bad: Bullet-heavy, over-fragmented

```markdown
### Features

- ⚡ **Super fast** rendering
- 🔒 **Secure** by default
- 📦 **Zero dependencies**
- 🎯 **Type safe**
- 🚀 **Easy to use**

### Benefits

- Great performance
- Works with any framework
```

## Good: Procedure page with minimal headings

```markdown
# Getting Started

Install `@kitajs/html` and `@kitajs/ts-html-plugin` together.

## TypeScript configuration

Add the following to your `tsconfig.json`.

## Verification

Write the following in a `.tsx` file:
```

## Bad: Over-structured with many sub-headings

```markdown
# Getting Started

## Prerequisites

### System Requirements

### Node.js Version

## Step 1: Installation

### Using npm

### Using yarn

### Using pnpm

## Step 2: Configuration

### Step 2a: TypeScript

### Step 2b: Editor
```
