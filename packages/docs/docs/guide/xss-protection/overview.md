# XSS Protection Overview

KitaJS Html provides **multi-layered XSS protection** to keep your applications secure.
Unlike many template engines that escape everything by default (breaking functionality),
or escape nothing (creating vulnerabilities), KitaJS takes a balanced approach with
compile-time detection.

## The Problem with XSS

Cross-Site Scripting (XSS) is one of the most common web security vulnerabilities. It
occurs when an attacker injects malicious scripts into otherwise trusted websites.

```tsx
// Dangerous! Malicious code can be injected
const username = '</div><script>stealPasswords()</script>';
const html = <div>{username}</div>;
// Output: <div></div><script>stealPasswords()</script>
```

## KitaJS's Multi-Layer Protection

### Layer 1: TypeScript Plugin (Development)

The `@kitajs/ts-html-plugin` analyzes your code in real-time:

```tsx
const userInput: string = req.body.comment;

// ❌ Error K601: XSS-prone content without safe attribute
<div>{userInput}</div>

// ✅ Safe - content is escaped
<div safe>{userInput}</div>
```

Your editor shows warnings **before you even save the file**.

Learn more: [XSS Scanner](/guide/xss-protection/scanner)

### Layer 2: CLI Scanner (CI/CD)

Run `xss-scan` in your continuous integration:

```bash
$ xss-scan
✓ Scanned 45 files
✗ Found 2 XSS vulnerabilities
```

This catches issues before they reach production.

Learn more: [XSS Scanner](/guide/xss-protection/scanner)

### Layer 3: Runtime Escaping (Production)

The `safe` attribute escapes content at runtime:

```tsx
function UserProfile({ name }: { name: string }) {
  return <div safe>{name}</div>;
}

// Malicious input is neutralized:
// Input: <script>alert('XSS')</script>
// Output: &lt;script&gt;alert('XSS')&lt;/script&gt;
```

Learn more: [Sanitization](/guide/xss-protection/sanitization)

## Safe by Design

KitaJS uses **type-driven safety**:

- ✅ **Always safe**: `number`, `boolean`, `bigint`, `null`, `undefined`, literals
- ⚠️ **Needs escaping**: `string`, `any`, dynamic content
- ✅ **Already safe**: `JSX.Element`, variables prefixed with `safe`, `Html.escapeHtml()`
  calls

```tsx
// Safe - number is never an XSS vector
<div>{count}</div>

// Safe - JSX elements are already strings
<div>{<span>Hello</span>}</div>

// Unsafe - dynamic string needs protection
const message: string = userInput;
<div safe>{message}</div>
```

## Best Practices

1. **Always use the `safe` attribute** for user input
2. **Run `xss-scan` in CI/CD** to catch issues early
3. **Use TypeScript strictly** - avoid `any` type
4. **Escape at the lowest level** - don't wrap entire components
5. **Validate input** - XSS protection is defense-in-depth, not a substitute for
   validation

## Example: Secure Component

```tsx
import type { PropsWithChildren } from '@kitajs/html';

interface UserCardProps {
  name: string; // User input
  email: string; // User input
  userId: number; // Safe - it's a number
  joinDate: Date; // Controlled - from database
}

function UserCard({ name, email, userId, joinDate }: UserCardProps) {
  return (
    <div class="user-card" data-user-id={userId}>
      <h2 safe>{name}</h2>
      <p safe>{email}</p>
      <time datetime={joinDate.toISOString()}>{joinDate.toDateString()}</time>
    </div>
  );
}
```

## Why This Approach?

**Traditional template engines:**

- ❌ Escape everything → breaks HTML injection
- ❌ Escape nothing → XSS vulnerabilities
- ❌ Manual escaping → easy to forget

**KitaJS Html:**

- ✅ Type-driven detection → catches issues early
- ✅ Explicit marking → clear what's user input
- ✅ Compile-time errors → no runtime surprises
- ✅ CI/CD integration → enforced in pipeline

## Next Steps

- [Scanner CLI](/guide/xss-protection/scanner) - Learn about xss-scan command
- [Sanitization](/guide/xss-protection/sanitization) - Deep dive into the `safe` attribute
- [Getting Started](/guide/getting-started) - Set up your project
