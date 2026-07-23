# Project Structure

This document outlines the organization of the Arrivo codebase to help contributors and AI agents navigate the project effectively.

## High-Level Directory Structure

```text
appointment-saas/
├── apps/
│   └── web/                 # The main Next.js App Router application
│       ├── app/             # Application routes and pages
│       ├── components/      # Reusable React components
│       ├── lib/             # Utilities, database schema, and shared logic
│       ├── messages/        # Internationalization (i18n) dictionaries
│       ├── public/          # Static assets (images, icons, manifest)
│       └── drizzle/         # Database migrations
├── docs/                    # Project documentation (PRD, Architecture, Epics, etc.)
└── package.json             # Root monorepo configuration (pnpm workspace)
```

## `apps/web/` Detailed Breakdown

### `app/` (Routing & Actions)
The Next.js App Router directory handles all routing, page layouts, and server actions.

- `(auth)/` — Grouped routes for authentication flows (e.g., `/login`, `/register`, `/forgot-password`).
- `[locale]/` — Dynamic route segment for internationalization.
- `actions/` — Next.js Server Actions (mutations). **This is where business logic lives.** E.g., `auth.ts`, `organization.ts`.
- `api/` — Next.js Route Handlers (REST endpoints or webhooks).

### `components/` (Presentation Layer)
All shared React components are stored here. They should ideally be "dumb" presentation components, leaving data fetching to the page or layout.

- `ui/` — shadcn/ui generic primitives (Buttons, Inputs, Dialogs). **Do not modify these unless necessary.**
- `forms/` — Client-side form components utilizing `react-hook-form` and Zod.
- `layout/` — Shared layout components (Navbars, Sidebars, Footers).

### `lib/` (Core Application Code)
The foundational plumbing of the application.

- `db/` — Drizzle ORM configuration and schemas.
  - `schema.ts` — The single source of truth for the database schema.
- `supabase/` — Supabase client configuration and SSR middleware.
- `auth/` — Authentication helpers (e.g., `ensure-app-user.ts`).

### `messages/` (i18n)
Contains translation files for `next-intl`. Grouped by language code (e.g., `en/`, `hi/`) and split into feature-specific namespaces (e.g., `common.json`, `auth.json`).

## Architectural Rules

1. **Where Business Logic Belongs**: In Next.js **Server Actions** (`app/actions/`) or specialized services in `lib/`. Avoid writing complex business logic directly in Server Components or Route Handlers.
2. **Where Validation Belongs**: Use **Zod schemas**. Shared schemas should live alongside the feature they validate, or in a `lib/schemas/` directory if reused across client and server.
3. **Where Database Queries Belong**: Inside Server Actions or data-fetching utilities in `lib/db/queries/`. Do not run direct DB queries inside Client Components.
4. **How to Add a New Feature**:
   - Define the database schema in `lib/db/schema.ts` and run a migration.
   - Create a Server Action in `app/actions/` for any mutations.
   - Build the UI in `app/[locale]/` using Server Components to fetch data.
   - Extract interactive parts into Client Components in `components/`.
   - Add required translation keys to `messages/en/`.
