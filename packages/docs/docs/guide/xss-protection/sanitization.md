# XSS & Sanitization

This package sanitizes every attribute by default. However, since the resulting element is
always a string, it's impossible to differentiate an HTML element created by a `<tag>` or
from user input.

:::danger XSS Warning The Kita/Html template engine can introduce **XSS vulnerabilities**
if not set up properly.

Please make sure you have followed the
[getting started configuration steps](/guide/getting-started). :::

## What is XSS?

Cross-Site Scripting (XSS) attacks are a type of injection, in which malicious scripts are
injected into otherwise benign and trusted websites. XSS attacks occur when an attacker
uses a web application to send malicious code, generally in the form of a browser side
script, to a different end user.

**Source:** [OWASP](https://owasp.org/www-community/attacks/xss/)

### Example of XSS Vulnerability

Consider this seemingly harmless code:

```tsx
function Username({ name }: Props) {
  return <div>{name}</div>;
}
```

If the `name` variable contains malicious code, it will be executed when the component is
rendered:

```tsx
const username = '</div><script>getStoredPasswordAndSentToBadGuysServer()</script>';

const input = <Username name={username} />;

// Resolves into:
// '<div></div><script>getStoredPasswordAndSentToBadGuysServer()</script>'
// which will execute the malicious code when rendered in the browser!
```

## Escaping Content

Always use the `safe` attribute or manually call `Html.escapeHtml` to protect against XSS
vulnerabilities when rendering user input.

```tsx
function Username({ name }: Props) {
  // ❌ Unsafe
  return <div>{name}</div>;

  // ✅ Safe - content is escaped
  return <div safe>{name}</div>;
}
```

Your editor should show a warning immediately after you write unsafe code:

![XSS detection example](/xss-preview.png)

### Manual Escaping

You can use the `escapeHtml` API to escape content manually:

```tsx
import { escapeHtml } from '@kitajs/html';

export function formatUsername(username: string): JSX.Element {
  return 'Hello ' + escapeHtml(username);
}
```

### Template Literal Escaping

For better ergonomics, use the `escape` function (or its alias `e`):

```tsx
import { e } from '@kitajs/html';
// import { escape } from '@kitajs/html' also works

export function formatUsername(username: string): JSX.Element {
  return e`Hello ${username}`;
}
```

## The Safe Attribute

Always use the `safe` attribute when rendering uncontrolled user input. This will sanitize
the contents and prevent XSS attacks.

```tsx
function UserCard({ name, description, date, about }: Props) {
  return (
    <div class="card">
      <h1 safe>{name}</h1>
      <br />
      <p safe>{description}</p>
      <br />
      {/* Controlled input, no need to sanitize */}
      <time datetime={date.toISOString()}>{date.toDateString()}</time>
      <br />
      <p safe>{about}</p>
    </div>
  );
}
```

:::tip Best Practice Only use the `safe` attribute at the very bottom of the HTML tree
where it's needed. Don't wrap entire components with `safe` as it may lead to double
escaping issues. :::

## How Attributes Are Sanitized

Attributes are **always** sanitized by default:

```tsx
<div attr="This WILL be escaped"></div>
<div safe>This WILL be escaped</div>
<div>{Html.escapeHtml('This WILL be escaped')}</div>
<div>{e`This WILL be escaped: ${someVar}`}</div>

<div>⚠️ This will NOT be escaped and WILL expose you to XSS</div>
```

## Safe vs Unsafe Content

Here's a dangerous example of how malicious code can be injected:

```tsx
const user = {
  name: 'Bad guy',
  description: '</div><script>getStoredPasswordAndSentToBadGuysServer()</script>'
};

// ❌ Executes malicious code:
const unsafe = <div class="user-card">{user.description}</div>;
// Output: <div class="user-card"></div><script>getStoredPasswordAndSentToBadGuysServer()</script>

// ✅ Does not execute any malicious code:
const safe = (
  <div class="user-card" safe>
    {user.description}
  </div>
);
// Output: <div class="user-card">&lt;/div&gt;&lt;script&gt;getStoredPasswordAndSentToBadGuysServer()&lt;/script&gt;</div>
```

## Type-Safe Content

The TypeScript plugin helps you by understanding which types are safe:

- ✅ **Safe types**: `number`, `boolean`, `bigint`, `JSX.Element`, literals
- ❌ **Unsafe types**: `string`, `any`, objects with `toString()`
- ⚠️ **Suppression**: Variables prefixed with `safe`, calls to `escapeHtml()`

```tsx
// Safe - numbers are never XSS vectors
<div>{42}</div>

// Safe - booleans are never XSS vectors
<div>{true}</div>

// Unsafe - strings might contain malicious code
const text: string = userInput;
<div>{text}</div> // Error: K601

// Safe - explicitly escaped
<div safe>{text}</div>
```

## Next Steps

- Learn about the [XSS Scanner CLI](/guide/xss-protection/scanner)
- Explore [JSX Syntax](/guide/features/jsx-syntax) features
- Try [Async Components](/guide/features/async-components)
