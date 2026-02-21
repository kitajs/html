# Using the Safe Attribute

Every child expression in Kita Html renders without escaping by default. To escape user
input, apply the `safe` attribute to the nearest native element wrapping the expression.

## Native elements

Add `safe` to the element that directly contains the dynamic content. The runtime passes
all children through HTML entity escaping before concatenation.

```tsx
<div safe>{userInput}</div>
// If userInput is '<script>alert(1)</script>'
// Renders: <div>&lt;script&gt;alert(1)&lt;/script&gt;</div>
```

Without `safe`, malicious input executes. Consider a user profile where the description
field contains
`</div><script>fetch('/steal', {method: 'POST', body: document.cookie})</script>`.
Rendering this without escaping closes the container early, injects a script tag, and runs
arbitrary code. The `safe` attribute converts the angle brackets to `&lt;` and `&gt;`,
rendering the payload as harmless text.

Place `safe` on the innermost element that holds the untrusted value. Do not add it to a
parent wrapper, as that would escape the HTML of child components too.

```tsx
function UserCard({ name, bio }: { name: string; bio: string }) {
  return (
    <div class="card">
      <h2 safe>{name}</h2>
      <p safe>{bio}</p>
    </div>
  );
}
```

## Component children

Adding `safe` to a component suppresses the XSS diagnostic and passes `safe` as a prop.
The component is then responsible for applying it to its inner native elements. If the
component does not forward `safe`, use `Html.escapeHtml()` to escape the value before
passing it.

```tsx
// safe is passed as a prop, the component must handle it
<MyComponent safe>{userInput}</MyComponent>

// Or escape explicitly when the component doesn't support safe
<MyComponent>{Html.escapeHtml(userInput)}</MyComponent>
```

## Template literal helper

The `e` tagged template escapes interpolated values while preserving literal HTML around
them.

```tsx
import { e } from '@kitajs/html';

const html = e`<p>Hello, ${userName}!</p>`;
```

## Suppression conventions

When the XSS detection plugin flags a value that you know is safe, you can suppress the
warning without adding `safe` to the element.

Prefix the variable name with `safe`. The plugin treats any identifier starting with
`safe` as pre-escaped.

```tsx
const safeContent = sanitizeElsewhere(rawInput);
<div>{safeContent}</div>;
```

Cast the expression to `'safe'` inline. This tells the plugin to skip the check for that
specific usage.

```tsx
<div>{content as 'safe'}</div>
```

Call `Html.escapeHtml()` directly. The plugin recognizes the return value as escaped.

```tsx
<div>{Html.escapeHtml(content)}</div>
```
