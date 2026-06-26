---
name: transitions-dev
description: Production-ready CSS transition patterns for web apps — cards, modals, dropdowns, panels.
metadata:
  author: jakubantalik
  source: ibelick/ui-skills
---

# Transitions Dev

Use when adding motion that respects performance and reduced-motion preferences.

## Protocol

1. Prefer `opacity` and `transform` for enter/exit animations
2. Respect `prefers-reduced-motion: reduce`
3. Keep modal transitions under 300ms
4. Avoid animating layout properties (width, height, top)
