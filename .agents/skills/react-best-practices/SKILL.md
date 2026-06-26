---
name: react-best-practices
description: Vercel React best practices for rendering performance, bundle efficiency, and scalable component architecture.
metadata:
  author: vercel-labs
  source: ibelick/ui-skills
---

# React Best Practices

Use when optimizing React apps for fewer re-renders and stable data flow.

## Protocol

1. Stabilize callbacks with `useCallback` when passed to memoized children
2. Memoize derived data with `useMemo` (filters, sorts, context objects)
3. Wrap list item components in `React.memo` when parent re-renders often
4. Precompute per-item values in parent instead of inline in `.map()`
5. Use React Query `select` and stable query keys when appropriate
6. Avoid recreating context value objects every render

## CLI

```bash
npx ui-skills get react-best-practices
```
