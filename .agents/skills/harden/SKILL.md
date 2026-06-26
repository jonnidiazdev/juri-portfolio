---
name: harden
description: Make interfaces production-ready with robust empty states, edge cases, errors, onboarding, and i18n resilience.
metadata:
  author: pbakaus
  source: ibelick/ui-skills
---

# Harden

Use when hardening UI for real-world failure modes and edge cases.

## Protocol

1. Replace `alert()` / `confirm()` with inline UI (`role="alert"`, confirm dialogs)
2. Show actionable error messages (what failed + how to fix)
3. Handle empty, loading, and partial-failure states explicitly
4. Surface auth and network errors in the interface voice (Spanish for this project)
5. Ensure dismiss controls are accessible (`aria-label`)

## CLI

```bash
npx ui-skills get harden
```
