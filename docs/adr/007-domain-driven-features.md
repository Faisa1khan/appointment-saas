# ADR 007: Domain-Driven Feature Architecture

## Context
As Arrivo grows, maintaining everything in global `components/`, `lib/`, and `actions/` directories will lead to a tightly coupled, hard-to-navigate codebase. A "big ball of mud" architecture slows down development and increases the risk of regressions.

## Decision
We are adopting a Domain-Driven Feature Folder architecture. Each business capability (e.g., Services, Staff, Bookings) will live in its own isolated feature module under `features/[feature-name]/`.

## Rules and Guidelines

1. **Isolation:** Each business capability lives in its own feature.
2. **Encapsulation:** Features should not import each other's internal components or logic directly. If cross-domain communication is needed, it should happen at the page level or through a public API/interface exported by the feature.
3. **Global vs. Local:**
   - Shared, generic UI (like a `Button` or `Dialog`) belongs in `components/ui/`.
   - Shared generic utilities belong in `lib/`.
   - Domain-specific logic, components, server actions, and schemas MUST stay inside the feature folder.
4. **Server Actions Collocation:** Server actions live within `features/[feature-name]/actions/`.
5. **Schema Collocation:** Zod schemas and TypeScript types remain close to the feature in `features/[feature-name]/schemas/` and `features/[feature-name]/types/`.

## Why this approach was chosen
Collocating related files improves readability, onboarding speed, and maintainability. It establishes clear boundaries and helps prevent the codebase from becoming tightly coupled. It also aligns perfectly with Next.js App Router paradigms where route segments can act as feature wrappers, or utilize `features/` as a sibling to `app/`.

## Consequences
- Developers must exercise judgment on when to extract code from a feature to the global `components/` or `lib/` directory.
- Refactoring may be required if a feature's scope grows too large or overlaps heavily with another.
