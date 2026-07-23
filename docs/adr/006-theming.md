# ADR 006: Theming and Design Tokens

## Context
A modern SaaS requires dynamic theming (Light, Dark, and System modes) and the flexibility to adjust visual styles without a massive refactor.

## Decision
We utilize Tailwind CSS with semantic design tokens (CSS variables) driven by `shadcn/ui` and `next-themes`.

## Why this approach was chosen
Using semantic classes like `bg-background` and `text-primary` instead of literal colors like `bg-white` and `text-black` allows the UI to automatically adapt to the user's active theme. `next-themes` manages the `dark` class on the root HTML element, preventing hydration mismatches and flickering.

## Consequences
- Literal color utility classes (`bg-red-500`, `text-blue-600`) are banned in favor of semantic equivalents (`bg-destructive`, `text-primary`).
- Developers must verify every new component in both Light and Dark modes before marking it Done.
