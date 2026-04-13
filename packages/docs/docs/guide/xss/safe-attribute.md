---
description:
  Escape untrusted JSX children with safe, Fragment safe, escapeHtml, and the supported
  suppression conventions.
---

# Using the Safe Attribute

Every child expression in Kita Html renders without escaping by default. To escape user
input, apply the `safe` attribute to the nearest native element wrapping the expression.

## Native elements

Add `safe` to the element that directly contains the dynamic content. The runtime passes
all children through HTML entity escaping before concatenation.

```tsx twoslash kita
// @noErrors
let userInput = `<script>alert('XSS')</script>` as const
// ---cut---
const html = <div safe>{userInput}</div>
//                        ^?
```

Without `safe`, malicious input executes. Consider a user profile where the description
field contains
`</div><script>fetch('/steal', {method: 'POST', body: document.cookie})</script>`.
Rendering this without escaping closes the container early, injects a script tag, and runs
arbitrary code. The `safe` attribute converts the angle brackets to `&lt;` and `&gt;`,
rendering the payload as harmless text.

Place `safe` on the innermost element that holds the untrusted value. Do not add it to a
parent wrapper, as that would escape the HTML of child components too.

```tsx twoslash kita
function UserCard({ name, bio }: { name: string; bio: string }) {
  return (
    <div class="card">
      <h2 safe>{name}</h2>
      <p safe>{bio}</p>
    </div>
  )
}
// ---cut-after---
const html = <UserCard name="Name" bio="Bio" />
```

## Component children

The `safe` attribute only applies to native elements. If you pass an unsafe value as a
child to a component, you must either escape it manually or wrap it in a Fragment with the
`safe` attribute to tell the plugin it's already escaped. This prevents components from
accidentally rendering unescaped HTML when they receive dynamic content as children.

```tsx twoslash kita
let userInput: string = 'User input!'
import { Fragment, Children, escapeHtml } from '@kitajs/html'
function MyComponent({ children }: { children: Children }) {
  return <div>{children}</div>
}
let html: JSX.Element
// ---cut---
html = (
  <MyComponent>
    <Fragment safe>{userInput}</Fragment>
  </MyComponent>
)

// Or escape explicitly when the component doesn't support safe
html = <MyComponent>{escapeHtml(userInput)}</MyComponent>
```

## Template literal helper

The `e` tagged template is an alias to `escapeHtml()` that you can use as interpolated
content in template literals. It provides a convenient way to escape dynamic values
outside of JSX.

```tsx twoslash kita
const userName = '<script>untrusted()</script>' as const
// ---cut---
import { e } from '@kitajs/html'

const html = e`Hello, ${userName}!`
```

## Suppression conventions

When the XSS detection plugin flags a value that you know is safe, you can suppress the
warning without adding `safe` to the element, which would escape all children and
potentially break components.

::: danger

Suppressing warnings is dangerous because it allows unescaped HTML to slip through. Only
use these techniques when you have a guarantee of safety.

:::

Prefix the variable name with `safe`. The plugin treats any identifier starting with
`safe` as pre-escaped.

```tsx twoslash kita
const rawInput = "<script>alert('XSS')</script>" as const
function sanitizeElsewhere(raw: string): string {
  // Some external library or custom logic that guarantees safety
  return raw.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
// ---cut---
const safeContent = sanitizeElsewhere(rawInput)
//                                     ^?
const html = <div>{safeContent}</div>
//                      ^?
```

Following the same logic, prefixing a variable with `unsafe` explicitly marks it as
unescaped and triggers a warning if used in JSX.

```tsx twoslash kita
// @errors: 88601
const unsafeContent = 'My safe string' as const
const html = <div>{unsafeContent}</div>
```

::: warning

Manual casts and naming conventions are not enforced by the compiler. They rely on
developer discipline and code reviews to ensure safety. Use them judiciously and document
the rationale for any exceptions.

:::

Cast the expression to `'safe'` inline. This tells the plugin to skip the check for that
specific usage and not warn about possible XSS vulnerabilities.

```tsx twoslash kita
const content: string = '<script>untrusted()</script>'
// ---cut---
const html = <div>{content as 'safe'}</div>
```

Call `Html.escapeHtml()` directly. The plugin recognizes the return value as escaped.

```tsx twoslash kita
const content: string = '<script>untrusted()</script>'
// ---cut---
import { Html } from '@kitajs/html'

const html = <div>{Html.escapeHtml(content)}</div>
```
