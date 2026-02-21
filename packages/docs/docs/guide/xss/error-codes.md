# Error Codes

The XSS detection engine emits four diagnostic codes. Each code links to a specific kind
of safety issue with a defined fix.

## K601

Severity: error. An expression with type `string` or `any` is used as a child of a native
element without the `safe` attribute.

```tsx
// Error
<div>{userName}</div>

// Fix: add safe
<div safe>{userName}</div>
```

## K602

Severity: error. The `safe` attribute is applied to an element whose children include JSX
elements. This would escape the HTML output of those child components, corrupting their
markup.

```tsx
// Error: safe escapes the inner component's output
<div safe><UserBadge name={user.name} /></div>

// Fix: remove safe from the parent, add it to the inner element instead
<div><UserBadge name={user.name} /></div>
```

## K603

Severity: error. An expression with type `string` or `any` is passed as a child to a
component (uppercase tag name) without the `safe` attribute.

```tsx
// Error
<Card>{userName}</Card>

// Fix: add safe (component must forward it to inner elements)
<Card safe>{userName}</Card>

// Or escape manually
<Card>{Html.escapeHtml(userName)}</Card>
```

## K604

Severity: warning. The `safe` attribute is applied to an element whose children are
already safe types (numbers, booleans, `JSX.Element`, etc.). The escaping is redundant and
can be removed.

```tsx
// Warning: count is a number, already safe
<span safe>{count}</span>

// Fix: remove safe
<span>{count}</span>
```
