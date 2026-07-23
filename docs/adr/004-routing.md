# ADR 004: Routing Architecture

## Context
Next.js offers both Pages and App Routers. We need a routing architecture that supports Server Components, layouts, nested routing, and robust internationalization.

## Decision
We chose the Next.js App Router paradigm with the `next-intl` middleware mapping to a `[locale]` dynamic route at the root level.

## Why this approach was chosen
The App Router is the modern standard for Next.js, allowing us to leverage React Server Components (RSCs) by default to improve performance. The top-level `[locale]` route ensures that language settings are seamlessly propagated through the URL (`/en/dashboard`, `/hi/login`), which is optimal for SEO and link sharing.

## Consequences
- Shared UI (like global providers) must reside within the `[locale]/layout.tsx`.
- All localized pages must sit within the `app/[locale]/` directory.
- `next-intl` is heavily integrated into our middleware stack.
