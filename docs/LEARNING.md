# Learning Journal

This document tracks everything I learn while building Arrivo.

Each completed story adds a new section using a standardized format to track objectives, prerequisites, architectural decisions, technologies, best practices, vocabulary, and actionable revision checklists.

---

# Story: E0-S1 - Initialize Project Foundation

## Date

2026-07-21

## Objective

Establish the core project foundation by initializing a Next.js 15 application according to the strictly defined tech stack requirements, ensuring a robust, scalable baseline before writing any feature code.

---

## Prerequisites

- React Fundamentals
- JavaScript ES6+
- TypeScript Basics
- Basic understanding of CSS
- Basic understanding of the Command Line (Terminal)

---

## What We Built

We bootstrapped the primary web application (`apps/web`) using Next.js 15 with the App Router. We configured Tailwind CSS v4 for styling, integrated shadcn/ui for component architecture, and established strict TypeScript and ESLint configurations. We also configured Turbopack for faster local development and set up a system-aware dark mode provider using `next-themes`. We deliberately avoided installing feature-specific dependencies (like databases or auth) to keep this foundation focused purely on the application shell.

---

## Why We Built It This Way

**Monorepo-ready Structure:** We placed the app inside `apps/web` to future-proof the architecture. If we later need mobile apps or background workers, they can easily sit alongside `apps/web`.

**App Router over Pages Router:** Next.js App Router represents the modern React paradigm (React Server Components). It offers better performance by pushing data fetching and rendering to the server by default, shipping less JavaScript to the browser.

**Tailwind v4 & shadcn/ui:** Tailwind allows rapid UI iteration without context-switching between CSS and TS files. `shadcn/ui` gives us accessible, unstyled components that we *own* (they are copied into our codebase, not installed as opaque npm packages). This provides maximum customization for the Arrivo brand.

**Turbopack & pnpm:** `pnpm` is significantly faster and more disk-efficient than `npm` due to its content-addressable store. Turbopack dramatically speeds up local dev server startup and hot-module replacement compared to Webpack.

---

## Architecture Decisions

- **Decision:** Use Next.js App Router instead of Pages Router.
  - **Reason:** Aligns with the modern React paradigm (Server Components).
  - **Trade-offs:** Steeper learning curve for data fetching patterns.
  - **Alternatives considered:** Vite (SPA), which would lack built-in SEO and SSR capabilities.
- **Decision:** Place the app inside `apps/web`.
  - **Reason:** Future-proofs the codebase for a monorepo setup.
  - **Trade-offs:** Slightly deeper folder structure.
  - **Alternatives considered:** A flat structure, which limits scaling to mobile apps later.

---

## Concepts to Master

### React Server Components (RSC)
- **What it is:** Components that run exclusively on the server and never ship their JavaScript to the client.
- **Why it exists:** To reduce client bundle sizes and allow components to securely access server-side resources (like databases or environment variables) without building separate API endpoints.
- **Why we need it:** To make Arrivo fast and SEO-friendly.
- **How it works:** Next.js renders the component to a special UI representation on the server, which the client then reconstructs into HTML.
- **Where it is used:** `app/page.tsx` and `app/layout.tsx` are Server Components by default.

### `use client` Directive
- **What it is:** A boundary marker that tells Next.js to bundle this component (and its imports) for the browser.
- **Why it exists:** To enable interactivity (clicks, state, effects) which Server Components cannot do.
- **Why we need it:** For things like theme toggling (`ThemeProvider`).
- **How it works:** You place `"use client";` at the very top of a file.
- **Where it is used:** In `components/providers.tsx` because it uses React Context to manage the dark/light theme state across the app.

---

## Vocabulary

- **Hydration:** The process where client-side JavaScript attaches event listeners to server-rendered HTML to make it interactive.
- **Server Component:** A React component that fetches data and renders exclusively on the server, sending zero JS to the client.
- **Client Component:** A traditional React component that executes in the browser and supports interactivity (`useState`, `useEffect`).
- **Provider:** A React component that wraps an application to provide global context (like theme or user data).
- **Bundler:** A tool (like Turbopack or Webpack) that combines multiple JavaScript files and assets into a single optimized file for the browser.
- **Monorepo:** A single repository containing multiple distinct projects (e.g., a web app and a mobile app) that can share code.
- **Tree Shaking:** The process of removing unused code from the final bundle during the build step.

---

## Files to Study

- **`apps/web/app/layout.tsx`**
  - **Purpose:** The root HTML shell for the entire application.
  - **Why it exists:** It defines global HTML structure, metadata, and wraps the app in necessary context providers.
  - **What to understand:** Notice the `suppressHydrationWarning` on the `<html>` tag (needed for `next-themes`) and how the `<Providers>` component wraps the `children`.

- **`apps/web/components/providers.tsx`**
  - **Purpose:** A centralized place for all client-side React Context providers.
  - **Why it exists:** Keeping providers out of `layout.tsx` allows the layout to remain a Server Component while delegating client state to this specific file.
  - **What to understand:** Notice the `"use client";` directive at the top.

- **`apps/web/package.json`**
  - **Purpose:** Defines project dependencies and scripts.
  - **Why it exists:** Node.js ecosystem standard for package management.
  - **What to understand:** Notice the `dev` script uses `next dev --turbopack` to enable the faster bundler.

- **`apps/web/app/globals.css`**
  - **Purpose:** Global styling and CSS variable definitions.
  - **Why it exists:** To define Tailwind v4 configuration and shadcn/ui color tokens.
  - **What to understand:** Notice how colors are defined as variables (e.g., `--background`) to support dynamic theming.

---

## Technologies Introduced

### Next.js 15 (App Router)
- **What it is:** A React framework for production.
- **Why we use it:** It handles routing, server-side rendering, and API creation out of the box.
- **Benefits:** Built-in performance optimizations, file-system based routing.
- **Alternatives:** Vite (SPA), Remix, Nuxt (Vue).
- **Common mistakes:** Using `"use client"` everywhere, which defeats the purpose of Server Components.
- **Best practices:** Keep components as Server Components by default; only use Client Components at the lowest possible level in the component tree.

### pnpm
- **What it is:** A fast, disk-space efficient package manager.
- **Why we use it:** Faster installs and strict dependency resolution (prevents "phantom dependencies").
- **Benefits:** Uses hard links to share packages across projects on your machine.
- **Alternatives:** npm, yarn.
- **Common mistakes:** Committing `package-lock.json` (npm) instead of `pnpm-lock.yaml`.

### shadcn/ui
- **What it is:** A collection of re-usable components that you copy and paste into your apps.
- **Why we use it:** Beautiful defaults, highly accessible, fully customizable.
- **Benefits:** You own the code. You can modify the button logic directly.
- **Alternatives:** Material UI, Chakra UI (these are opaque npm packages).
- **Best practices:** Use the CLI to add components, but feel free to modify the generated code in `components/ui/` to fit Arrivo's needs.

---

## Best Practices Learned

- **Separation of Concerns (Providers):** We extracted `ThemeProvider` into `components/providers.tsx` instead of putting it directly in `layout.tsx`. This keeps the root layout as a Server Component.
- **Strict Typing:** Enabled strict mode in `tsconfig.json` to catch potential runtime errors at compile time.
- **Documentation as Code:** Before writing code, we finalized `ARCHITECTURE.md` and `STACK.md`. Code is merely the execution of documented decisions.
- **Clean Default States:** We removed all Next.js boilerplate from `page.tsx` and replaced it with a minimal, clean placeholder to start with a blank slate.

---

## Common Mistakes

- **Using `"use client"` everywhere:** This defeats the purpose of the App Router and React Server Components. It forces all code to run on the client, leading to bloated JavaScript bundles.
- **Mixing UI and Business Logic in layout files:** `layout.tsx` should primarily handle HTML structure and Providers, not complex data fetching or UI state.
- **Not running `pnpm typecheck`:** TypeScript errors won't crash `pnpm dev` immediately, leading to broken builds down the line. Always verify types using `tsc --noEmit`.

---

## Where This Will Be Used

This story prepares the technical foundation for:
- **Authentication (Epic 1):** We now have a Next.js environment ready to handle Supabase Auth.
- **Organization Settings (Epic 2):** We have shadcn/ui configured and ready for forms.
- **Dashboard:** The routing system is set up to handle the `/` dashboard page.

---

## Common Interview Questions

**Q: What is the difference between a React Server Component and a Client Component in Next.js?**
**A:** Server Components render exclusively on the server, reducing the JavaScript bundle sent to the browser, and can securely access backend resources directly. Client Components render on both the server (for initial HTML) and the browser (for interactivity) and are required whenever you need `useState`, `useEffect`, or browser APIs.

**Q: Why would you use `pnpm` instead of `npm`?**
**A:** `pnpm` is faster and uses significantly less disk space because it stores all packages in a global content-addressable store and uses hard links to connect them to your project's `node_modules`. It also enforces strict dependency resolution, preventing you from importing packages you haven't explicitly declared in `package.json`.

**Q: Why might a team choose shadcn/ui over a traditional component library like Material UI?**
**A:** Traditional libraries are installed as npm packages, making them hard to customize deeply without fighting the library's CSS-in-JS or configuration systems. shadcn/ui provides the raw component code directly into your project, giving you complete ownership and maximum customizability using standard Tailwind CSS.

---

## Exercises

1. **Investigate the DOM:** Start the development server (`pnpm dev`). Open your browser's developer tools and inspect the `<html>` tag. Change your OS system theme from light to dark. Observe how the `class="dark"` attribute is added/removed automatically.
2. **Break the Build:** Open `app/layout.tsx` and add a `console.log(window.innerWidth)` inside the `RootLayout` component. Try to run the app. Read the error message carefully to understand why Server Components cannot access browser APIs. Remove the line afterward.
3. **Trace the Utility:** Open `lib/utils.ts`. Read the `cn` function. Look up the documentation for `clsx` and `tailwind-merge` online to understand exactly what problem this small function solves when combining Tailwind classes.

---

## Further Reading

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components Explained](https://react.dev/reference/rsc/server-components)
- [shadcn/ui Introduction](https://ui.shadcn.com/docs)
- [pnpm Motivation](https://pnpm.io/motivation)

---

## Revision Checklist

- [ ] I can explain what React Server Components are and why they are useful.
- [ ] I can explain the difference between a Server Component and a Client Component.
- [ ] I can explain what the `"use client"` directive does.
- [ ] I can define hydration, monorepo, and bundler.
- [ ] I can explain why we are using pnpm instead of npm.
- [ ] I understand how shadcn/ui differs from traditional component libraries.

---

## Key Takeaways

- Start with a solid, documented foundation before writing feature code.
- Next.js App Router heavily leverages React Server Components; default to server rendering and only use `"use client"` when necessary.
- We own our UI components via shadcn/ui, giving us maximum control over Arrivo's styling.
- Extracted client providers (`ThemeProvider`) keep our root layout clean and server-rendered.

---

# Story: E0-S2 - Configure Supabase Project

## Date

2026-07-21

## Objective

Configure Supabase as the backend infrastructure provider and establish a secure, server-aware Supabase client architecture in Next.js 15 using `@supabase/supabase-js` and `@supabase/ssr`.

---

## Prerequisites

- Next.js 15 App Router concepts (Server Components, Client Components, Middleware).
- Basic understanding of HTTP cookies and HTTP request/response lifecycles.
- Fundamentals of relational databases (PostgreSQL) and Auth concepts (JWTs, Sessions).

---

## What We Built

We integrated Supabase into our Next.js application by installing `@supabase/supabase-js` and `@supabase/ssr`. We created standard environment variable templates (`.env.example`) and established a modular, environment-aware Supabase client structure in `apps/web/lib/supabase/`:
- **`client.ts`**: Instantiates a browser-side Supabase client (`createBrowserClient`) for interactive Client Components.
- **`server.ts`**: Instantiates a server-side Supabase client (`createServerClient`) configured to read and mutate cookies using Next.js `cookies()` helper for Server Components, Server Actions, and Route Handlers.
- **`middleware.ts`**: Utility function (`updateSession`) to refresh Supabase auth tokens on incoming HTTP requests.
- **`middleware.ts` (Next.js Root)**: Invokes `updateSession` to ensure user sessions remain fresh and consistent across requests.

---

## Why We Built It This Way

**`@supabase/ssr` Package:** In Next.js App Router, server-rendered components and middleware run on the server where browser `localStorage` does not exist. Using `@supabase/ssr` ensures auth tokens are stored securely in HTTP cookies, enabling Server Components, Route Handlers, and Middleware to access the authenticated user state seamlessly.

**Separation of Client Concerns:** Providing dedicated `createClient` helpers for browser (`client.ts`) and server (`server.ts`) contexts prevents accidental usage of server cookie functions in the browser or trying to access browser APIs on the server.

**Non-Blocking Middleware Session Refresh:** The middleware checks and refreshes auth tokens before requests reach components, preventing expired session tokens while keeping routes open and unrestricted at this stage.

---

## Architecture Decisions

- **Decision:** Use `@supabase/ssr` instead of managing custom cookie adapters or using legacy helper libraries (`@supabase/auth-helpers-nextjs`).
  - **Reason:** `@supabase/ssr` is the official modern standard for Supabase with Next.js App Router and React 19.
  - **Trade-offs:** Requires careful handling of cookie get/set methods across Server Components and Middleware.
  - **Alternatives considered:** `@supabase/auth-helpers-nextjs` (deprecated in favor of `@supabase/ssr`).
- **Decision:** Separate client creation into `client.ts`, `server.ts`, and `middleware.ts`.
  - **Reason:** Isolates execution environments to enforce proper Next.js security and data lifecycle patterns.

---

## Concepts to Master

### What is Supabase?
- **What it is:** An open-source Backend-as-a-Service (BaaS) built on top of PostgreSQL. It provides managed Postgres databases, authentication services, row-level security (RLS), real-time subscriptions, edge functions, and object storage.
- **Why Arrivo uses Supabase:** Arrivo relies on Supabase for enterprise-grade PostgreSQL hosting, built-in Auth, robust Row Level Security (RLS) for multi-tenancy, and scalable storage without needing to manage infrastructure manually.

### Browser vs Server Clients
- **Browser Client (`client.ts`):** Used inside Client Components (`"use client"`). Runs in the browser DOM and relies on browser APIs.
- **Server Client (`server.ts`):** Used in Server Components, Server Actions, and Route Handlers. Runs strictly on the server and reads/writes cookies using Next.js `cookies()` API.

### Why Middleware is Required
- **Session Persistence & Token Refresh:** Because JWT access tokens expire periodically, Next.js middleware intercepting incoming requests allows Supabase to validate and refresh authentication tokens using refresh tokens before Server Components execute.
- **Server Component Cookie Limitations:** Next.js Server Components cannot set or modify cookies directly during rendering. Middleware acts as the entry point where cookie headers can be read, updated, and sent back in the HTTP response.

### Environment Variables & Keys
- **`NEXT_PUBLIC_SUPABASE_URL`:** The public HTTPS endpoint of the Supabase project. Accessible to both client and server.
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`:** The anonymous public API key. Safe to expose in the browser. Access is restricted by database Row Level Security (RLS) policies.
- **`SUPABASE_SERVICE_ROLE_KEY`:** Secret admin key with full superuser privileges, bypassing all RLS rules. Must **NEVER** be exposed to the client or committed to source control.

### How Authentication Sessions Work
- Supabase Auth issues JSON Web Tokens (JWTs) containing user claims.
- Tokens are stored in secure HTTP cookies handled by `@supabase/ssr`.
- Every request carries these cookies to the server. Middleware validates the token with Supabase and refreshes it if needed, passing updated cookies back to the user's browser.

---

## Vocabulary

- **BaaS (Backend-as-a-Service):** A cloud service model providing developers with server-side infrastructure (auth, database, storage) via APIs.
- **Anon Key (Anonymous Key):** A public API key intended for client-side API requests subject to Row Level Security.
- **Service Role Key:** A privileged server-only API key that bypasses Row Level Security.
- **JWT (JSON Web Token):** A compact, URL-safe means of representing claims to be transferred between two parties.
- **Refresh Token:** A long-lived credential used to obtain new access tokens without requiring the user to re-enter credentials.

---

## Files to Study

- **`apps/web/lib/supabase/client.ts`**: Browser client factory function using `createBrowserClient`.
- **`apps/web/lib/supabase/server.ts`**: Server client factory function integrating Next.js `cookies()` with `createServerClient`.
- **`apps/web/lib/supabase/middleware.ts`**: Session update utility (`updateSession`) handling auth token refreshing.
- **`apps/web/middleware.ts`**: Root Next.js middleware file routing requests through `updateSession`.
- **`apps/web/.env.example`**: Documentation of required environment variable keys.

---

## Technologies Introduced

- **`@supabase/supabase-js`**: Core Supabase JavaScript SDK for database, auth, and storage interactions.
- **`@supabase/ssr`**: Supabase package for cookie-based auth session management across SSR frameworks.

---

## Best Practices

- Always use `client.ts` in Client Components and `server.ts` in Server Components / Actions / Route Handlers.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to any file evaluated on the client (never prefix with `NEXT_PUBLIC_`).
- Keep `.env.example` updated with necessary environment variable names without real secret values.
- Rely on Middleware for token refresh rather than attempting to set cookies within Server Component render passes.

---

## Common Mistakes

- **Importing `server.ts` in a Client Component:** Causes runtime errors because Next.js `cookies()` header utilities are not available in browser runtime.
- **Exposing Service Role Key:** Accidental usage of `SUPABASE_SERVICE_ROLE_KEY` on the frontend bypasses RLS and compromises the entire database.
- **Forgetting Middleware Matcher Exclusions:** Running middleware on static assets (`_next/static`, images) degrades site performance.

---

## Where This Will Be Used

- **Epic 1 (Auth & Onboarding):** Sign up, login, logout, and session checks will use these clients.
- **Epic 2+ (Database Operations):** Drizzle ORM and Supabase queries will use connection configs verified here.

---

## Common Interview Questions

**Q: Why do we need `@supabase/ssr` instead of `@supabase/supabase-js` alone in Next.js App Router?**
**A:** Standard `@supabase/supabase-js` uses `localStorage` by default to persist auth tokens, which is unavailable during Server-Side Rendering (SSR). `@supabase/ssr` stores tokens in HTTP cookies, allowing Server Components and Middleware to read the user session on the server.

**Q: What is the difference between Supabase Anon Key and Service Role Key?**
**A:** The Anon Key is safe to distribute to browsers because database access is strictly governed by PostgreSQL Row Level Security (RLS) policies. The Service Role Key bypasses all RLS checks entirely and grants full database access; it must remain secret on the server.

---

## Exercises

1. **Verify Client Instantiation:** Import `createClient` from `@/lib/supabase/client` in a test page and log `supabase.auth`. Observe that client instantiation completes without errors.
2. **Inspect Cookies:** In browser dev tools, view the Storage -> Cookies tab after initializing a session to trace how auth tokens are stored.

---

## Further Reading

- [Supabase SSR Docs for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Auth Overview](https://supabase.com/docs/guides/auth)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

## Revision Checklist

- [ ] I can explain what Supabase is and why Arrivo uses it.
- [ ] I understand the difference between browser and server Supabase clients.
- [ ] I know why middleware is required for auth session refresh in Next.js App Router.
- [ ] I can differentiate between `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.

---

## Key Takeaways

- Supabase provides Arrivo's backend infrastructure (Postgres, Auth, Storage, RLS).
- `@supabase/ssr` connects Next.js server runtime with Supabase Auth via HTTP cookies.
- Environment variables isolate secrets, ensuring client-safe keys remain distinct from superuser keys.

---

# Story: E0-S3 - Configure Drizzle ORM

## Date

2026-07-21

## Objective

Establish the core database schema layer and migration pipeline using Drizzle ORM, TypeScript schema definitions, and Drizzle Kit matching `docs/DATABASE.md`.

---

## Prerequisites

- Relational Database Management Systems (RDBMS) & PostgreSQL fundamentals.
- Understanding of Object-Relational Mapping (ORM) vs. Schema-first query builders.
- SQL DDL (Data Definition Language): Tables, Primary Keys, Foreign Keys, Indexes, Constraints, and Enums.

---

## What We Built

We configured Drizzle ORM and Drizzle Kit inside `apps/web`:
- **`apps/web/lib/db/schema.ts`**: Implemented TypeScript table definitions for all 10 core entities (`organizations`, `organization_members`, `customers`, `services`, `resources`, `business_hours`, `business_closures`, `resource_schedules`, `bookings`, `booking_services`) plus Supabase `auth.users` reference, 3 PostgreSQL Enums (`booking_source`, `booking_status`, `member_role`), indexes, unique constraints, and check constraints matching `docs/DATABASE.md`.
- **`apps/web/lib/db/index.ts`**: Created a reusable, type-safe database client using `drizzle-orm/postgres-js` with serverless-safe prefetch settings.
- **`apps/web/drizzle.config.ts`**: Configured migration pipeline targeting PostgreSQL with outputs sent to `./drizzle/migrations`.
- **`apps/web/package.json`**: Added scripts (`db:generate`, `db:migrate`, `db:push`, `db:studio`).
- **Initial Migration**: Generated `0000_true_fallen_one.sql` via `pnpm db:generate`.

---

## Why We Built It This Way

**TypeScript-First Schema:** Defining database tables using Drizzle ORM in TypeScript ensures end-to-end type safety between database columns and application code, catching schema mismatches at compile time rather than runtime.

**Schema-First Documentation Alignment:** `docs/DATABASE.md` is our authoritative database contract. Writing explicit check constraints (`CHECK (end_time > start_time)`, `CHECK (phone IS NOT NULL OR email IS NOT NULL)`), cascading foreign keys, and indexes directly into Drizzle ensures database-level integrity enforced by PostgreSQL.

**Declarative Migration Pipeline:** Drizzle Kit automatically diffs the TypeScript schema against previous migrations to generate deterministic SQL migration files (`.sql`), preventing manual SQL errors in production environments.

---

## Architecture Decisions

- **Decision:** Use `drizzle-orm/postgres-js` for database connection.
  - **Reason:** `postgres.js` is extremely fast, lightweight, and supports connection pooling and serverless environments cleanly with `prepare: false`.
  - **Trade-offs:** Requires direct connection parameters or connection poolers (e.g. Supabase Transaction Pooler).
- **Decision:** Refer to Supabase `auth.users` via `pgSchema('auth').table('users', ...)`.
  - **Reason:** Supabase Auth owns user records in the `auth` schema. Linking foreign keys to `auth.users` maintains referential integrity while respecting schema isolation.

---

## Concepts to Master

### ORM vs Query Builder
- **What it is:** Traditional ORMs map database rows to heavy class objects. Drizzle acts as a lightweight, type-safe SQL query builder where SQL concepts map 1-to-1 with TypeScript code.
- **Why Arrivo uses Drizzle:** Zero abstraction overhead, instant startup times, serverless compatibility, and automatic TypeScript type inference (`InferSelectModel`, `InferInsertModel`).

### Migrations Pipeline
- **`pnpm db:generate`**: Compares `schema.ts` against existing migration files and generates a new `.sql` file.
- **`pnpm db:migrate`**: Applies unapplied `.sql` migration files to the target database in order.
- **`pnpm db:push`**: Directly pushes schema changes to the database without generating migration files (useful for fast prototyping in local dev).

---

## Vocabulary

- **Migration:** A versioned file containing SQL DDL statements that transition a database schema from one state to another.
- **Foreign Key Cascade (`ON DELETE CASCADE`):** A constraint action that automatically deletes child records when their parent record is deleted.
- **Snapshot Record (`ON DELETE SET NULL`):** A foreign key configuration that preserves historical records (e.g., `booking_services`) by setting the foreign key column to NULL if the original entity (e.g., `service`) is deleted.

---

## Files to Study

- **`apps/web/lib/db/schema.ts`**: The single source of truth for database table definitions and enums.
- **`apps/web/lib/db/index.ts`**: Reusable database connection client.
- **`apps/web/drizzle.config.ts`**: Drizzle Kit configuration file.
- **`apps/web/drizzle/migrations/0000_true_fallen_one.sql`**: Generated SQL DDL migration.

---

## Technologies Introduced

- **`drizzle-orm`**: TypeScript ORM for SQL databases.
- **`drizzle-kit`**: CLI tool for schema management, migrations, and Drizzle Studio GUI.
- **`postgres` (postgres.js)**: Fast PostgreSQL client driver for Node.js/TypeScript.

---

## Best Practices

- Always update `docs/DATABASE.md` BEFORE modifying `apps/web/lib/db/schema.ts`.
- Always inspect generated SQL files in `drizzle/migrations/` before running migrations.
- Use `prepare: false` on `postgres.js` when connecting to connection poolers or serverless runtimes.

---

## Common Mistakes

- **Editing Production Databases Manually:** Bypasses migration tracking and breaks schema sync across team environments.
- **Missing `CHECK` Constraints:** Relying solely on frontend validation allows invalid data state to persist if an API request bypasses the client.

---

## Where This Will Be Used

- **All Epics:** All data fetching, mutations, background jobs, and backend queries across Arrivo will query tables defined in `schema.ts` via `db`.

---

## Common Interview Questions

**Q: Why use Drizzle ORM over Prisma in Next.js App Router?**
**A:** Drizzle is significantly lighter (no heavy Rust binary execution), has faster cold-start performance in serverless environments, uses standard SQL syntax instead of a custom DSL, and generates lightweight JavaScript bundles.

---

## Exercises

1. **Inspect Generated SQL:** Open `apps/web/drizzle/migrations/0000_true_fallen_one.sql` and trace how Drizzle translated `check()` and `uniqueIndex()` helper functions into raw PostgreSQL DDL code.

---

## Further Reading

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit Migrations Guide](https://orm.drizzle.team/docs/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Revision Checklist

- [ ] I can explain what Drizzle ORM is and why Arrivo uses it.
- [ ] I understand how to define tables, foreign keys, indexes, and enums in Drizzle.
- [ ] I can execute `pnpm db:generate` to produce SQL migration files.

---

## Key Takeaways

- Drizzle provides type-safe, performance-optimized database access for Arrivo.
- Database schema in `lib/db/schema.ts` strictly reflects `docs/DATABASE.md`.

---

# Story: E0-S4 - Enable Row Level Security (RLS)

## Date

2026-07-22

## Objective

Enable PostgreSQL Row Level Security (RLS) for all tenant-scoped tables and implement secure, least-privilege access policies using Supabase Auth to ensure users can only access data belonging to organizations they are members of.

---

## Prerequisites

- Relational Database Management Systems (RDBMS) & PostgreSQL fundamentals.
- Supabase Authentication and JWT claims.
- PostgreSQL Row Level Security (RLS) and policies.

---

## What We Built

We created a custom SQL migration file to enable Row Level Security on the 10 tenant-scoped tables. We implemented strict RLS policies to enforce tenant boundaries:
- Added a `SECURITY DEFINER` helper function `is_org_member(org_id)` to centralize and simplify the verification of whether the currently authenticated user (`auth.uid()`) belongs to an organization.
- Applied `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies to tenant-scoped tables, leveraging this helper function.
- Allowed public `SELECT` access to `services`, `resources`, `business_hours`, `business_closures`, and `resource_schedules` to support the public booking engine, as specified in the database architecture.
- Delegated the creation of organizations and initial membership assignment to the backend using the Supabase Service Role key (which bypasses RLS), ensuring regular users cannot arbitrarily insert themselves into organizations via SQL.

---

## Why We Built It This Way

**Centralized Membership Logic:** Creating the `is_org_member` function abstracts the complex `EXISTS` subquery. This makes our RLS policies cleaner, easier to audit, and much easier to modify in the future if our authorization model evolves.

**Service Role for Organization Creation:** Since an organization does not exist before a user creates it, the user cannot be a "member" of it yet to satisfy an RLS policy. By using the Service Role key in a secure backend context (like a Server Action or API Route), we bypass RLS safely during this initial provisioning step without opening up `INSERT` access to all authenticated users.

**Public Read Policies:** A core requirement of the platform is allowing guest users to view availability and services on public booking pages. If we restricted everything to authenticated members, guests couldn't see anything. Thus, `services`, `resources`, and scheduling tables have public `SELECT` access while keeping mutations strictly protected.

---

## Architecture Decisions

- **Decision:** Use a custom PostgreSQL function for membership checks (`is_org_member`).
  - **Reason:** Simplifies RLS policies, reduces boilerplate, and provides a single source of truth for authorization checks in the database.
- **Decision:** Do not create `INSERT` RLS policies for `organizations`.
  - **Reason:** Creation of organizations will be securely handled by the backend using the Service Role key, bypassing RLS.

---

## Concepts to Master

### Row Level Security (RLS)
- **What it is:** A PostgreSQL feature that allows database administrators to define policies that restrict which rows can be returned by `SELECT` queries or affected by `INSERT`, `UPDATE`, and `DELETE` commands.
- **Why Arrivo uses it:** To guarantee multi-tenancy boundaries at the database level. Even if an API endpoint forgets to filter by `organization_id`, the database will prevent the leak.

### Security Definer Functions
- **What it is:** A PostgreSQL function modifier that executes the function with the privileges of the user who created it, rather than the user calling it.
- **Why we need it:** When policies query other tables (like `organization_members`) that are also RLS-protected, it can cause infinite recursion or privilege issues. `SECURITY DEFINER` (or careful policy structuring) bypasses this cleanly for administrative lookups.

---

## Vocabulary

- **Tenant:** A single organization or business using the SaaS platform.
- **Row Level Security (RLS):** Database-level security policies that restrict data access per row based on the session's context (e.g., the authenticated user).
- **Service Role Key:** A Supabase admin key that circumvents RLS entirely.

---

## Files to Study

- **`apps/web/drizzle/migrations/0001_enable_rls.sql`**: The custom SQL migration containing the `is_org_member` function and all policy definitions.

---

## Technologies Introduced

- **PostgreSQL RLS Policies**: Native database feature to secure data at the row level.

---

## Best Practices Learned

- **Extract Repeated Logic:** Move repeated, complex SQL subqueries in RLS policies into helper functions to improve readability and maintainability.
- **Defense in Depth:** Enforce security constraints (like tenant isolation) in the database via RLS, not just in the application code. This provides a hard safety net against developer errors.

---

## Common Mistakes

- **Infinite Recursion in RLS:** Writing an RLS policy on table A that queries table A, or querying table B which has a policy that queries table A.
- **Exposing the Service Role Key:** The Service Role key bypasses all the careful RLS policies we just wrote. It must never leak to the client.

---

## Where This Will Be Used

- **All Data Access:** Every single query the frontend or user-facing APIs make to the database will implicitly pass through these RLS policies.

---

## Common Interview Questions

**Q: How does Row Level Security (RLS) differ from traditional table-level permissions?**
**A:** Traditional permissions (GRANT/REVOKE) restrict access to entire tables (e.g., "User A can read the `customers` table"). RLS restricts access to specific rows within those tables based on conditions (e.g., "User A can only read rows in `customers` where `organization_id` matches their membership").

**Q: Why use a helper function in RLS policies?**
**A:** It reduces redundancy, makes policies easier to audit, and centralizes authorization logic. If the definition of a "member" changes, we only need to update the function, not every single policy across the database.

---

## Exercises

1. **Review Policies:** Read through `apps/web/drizzle/migrations/0001_enable_rls.sql` and identify which operations are allowed for anonymous users versus authenticated members.

---

## Further Reading

- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## Revision Checklist

- [ ] I can explain what Row Level Security (RLS) is and why it's critical for multi-tenant SaaS.
- [ ] I can describe the difference between public access and authenticated-member access in our schema.
- [ ] I understand why the `organizations` table relies on the Service Role key for `INSERT` operations.

---

## Key Takeaways

- RLS provides database-level isolation between tenants.
- Helper functions simplify RLS management.
- The `service_role` key is essential for securely bypassing RLS during initial provisioning (like creating organizations).

---

# Story: E0-S5 - Configure Vercel Deployment

## Date

2026-07-22

## Objective

Establish a continuous deployment (CD) pipeline by connecting the GitHub repository to Vercel and configuring the required environment variables for staging and production, ensuring that every push to the `main` branch automatically deploys.

---

## Prerequisites

- Understanding of Continuous Deployment (CD).
- Basic knowledge of environment variables and their role in different environments (Development, Preview, Production).
- Familiarity with the Vercel dashboard and GitHub integration.

---

## What We Built

We linked the `appointment-saas` GitHub repository to Vercel and configured the `apps/web` directory as the project root. We added the following environment variables to the Vercel dashboard for both Preview and Production environments:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

This ensures that our deployed app correctly connects to the Supabase backend.

---

## Why We Built It This Way

**Vercel for Next.js:** Vercel is the creator of Next.js and provides zero-config deployments, optimal caching, and edge networking for Next.js applications out of the box.
**Environment Variable Separation:** We use Vercel's environment variables rather than committing a `.env` file to securely inject configuration based on the environment (e.g., Preview vs. Production). 

---

## Architecture Decisions

- **Decision:** Use Vercel as the hosting provider.
  - **Reason:** Seamless integration with Next.js, automatic preview deployments for PRs, and built-in CI/CD pipelines.

---

## Concepts to Master

### Environment Variables Contexts
- **NEXT_PUBLIC_ Prefix:** Variables prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are exposed to the browser. They are safe to use in Client Components.
- **Secret Variables:** Variables without the prefix (e.g., `SUPABASE_SERVICE_ROLE_KEY`) are kept strictly on the server. They must never be used in client-side code, as they provide privileged access (e.g., bypassing Row Level Security).

### Continuous Deployment
- **What it is:** A software engineering approach where code changes are automatically prepared for a release to production.

---

## Vocabulary

- **CI/CD:** Continuous Integration / Continuous Deployment.
- **Preview Environment:** A temporary environment created automatically for a branch or pull request to preview changes before merging into `main`.

---

## Best Practices Learned

- **Environment Variable Security:** Always be cautious with API keys. `NEXT_PUBLIC_*` variables are safe for the client, while keys like `SUPABASE_SERVICE_ROLE_KEY` must only be accessed from server-side code (Server Actions, Route Handlers, API routes).
- **Test Locally First:** Always ensure the app builds successfully locally (`npm run build`) before pushing and relying on Vercel's build pipeline.

---

## Common Mistakes

- **Leaking Secrets:** Exposing the `SUPABASE_SERVICE_ROLE_KEY` to the client by incorrectly prefixing it with `NEXT_PUBLIC_` or importing it in a Client Component.
- **Incorrect Root Directory:** Forgetting to set `apps/web` as the root directory in a monorepo or sub-directory setup, leading to build failures on Vercel.

---

## Where This Will Be Used

- **Future Epics:** Every subsequent feature built (Authentication, Dashboards, Bookings) will be automatically deployed and testable in a real environment.

---

## Common Interview Questions

**Q: Why must `SUPABASE_SERVICE_ROLE_KEY` never be exposed to the browser?**
**A:** Because it bypasses all Row Level Security (RLS) policies in the database, granting full admin privileges. If a malicious user obtains it, they can read, modify, or delete all data across all tenants.

**Q: What is the difference between a `NEXT_PUBLIC_` environment variable and a standard environment variable in Next.js?**
**A:** `NEXT_PUBLIC_` variables are explicitly bundled into the client-side JavaScript and are accessible in the browser. Standard environment variables are only available in the Node.js runtime (server side).

---

## Revision Checklist

- [ ] I can deploy a Next.js application to Vercel.
- [ ] I understand the difference between Development, Preview, and Production environments.
- [ ] I know which environment variables are safe to expose to the client and which must remain on the server.

---

## Key Takeaways

- Vercel provides seamless CI/CD for Next.js applications.
- Proper handling of environment variables is critical for security, especially distinguishing between client-safe (`NEXT_PUBLIC_`) and server-only keys (`SUPABASE_SERVICE_ROLE_KEY`).
- We are now ready to build out the application features (Epic 1+), knowing that every push will be automatically deployed and testable.

# Epic 0 - Story E0-S6: Configure Error Logging and Monitoring

## Objective

Set up production-ready error tracking using Sentry in a Next.js 16 App Router application.

## What We Built

- Installed the official `@sentry/nextjs` SDK.
- Configured Sentry for the client, server, and edge environments.
- Wrapped the Next.js configuration to handle source map uploads during production builds.
- Added `instrumentation.ts` to hook directly into the Next.js lifecycle.

## Why We Built It This Way

- **Next.js App Router Support:** We used the official `instrumentation.ts` approach because it's the most robust way to catch unhandled errors in Next.js Server Components, Actions, and Route Handlers.
- **Environment Isolation:** We only enable Sentry when `process.env.NODE_ENV === 'production'` to avoid spamming the Sentry dashboard and cluttering the console during local development.
- **Source Maps:** We configured Sentry to upload source maps so that stack traces in production are readable, but we hid the source maps from the generated client bundles for security and payload size reasons.

## Concepts to Master

### Turbopack and Webpack Plugins
- **What it is:** Turbopack is Next.js's new rust-based bundler, replacing Webpack in dev mode (`next dev --turbopack`).
- **The Catch:** Turbopack does not support many legacy Webpack plugins. Sentry heavily relies on a Webpack plugin (configured via `withSentryConfig`) to automatically inject `sentry.client.config.ts` into the browser bundle. Because this plugin is skipped by Turbopack, Sentry fails to initialize on the client unless manually imported.
- **The Fix:** We created a `<SentryProvider>` Client Component that manually imports the client config, ensuring it executes regardless of the bundler used.

### Middleware vs Proxy (Next.js 16)
- **Deprecation:** In Next.js 16, the `middleware.ts` file convention was deprecated and renamed to `proxy.ts`. 
- **Reason:** The file acts as a reverse proxy running at the Edge rather than a traditional Node.js middleware. Renaming it to `proxy.ts` (with an `export async function proxy(...)`) better reflects its architectural role.

### Hydration Mismatches
- **Cause:** A mismatch between the HTML generated by the server and the HTML expected by React on the client.
- **Browser Extensions:** Extensions like Grammarly or ColorZilla often silently inject attributes (e.g. `cz-shortcut-listen`) into the `<body>` tag before React hydrates, causing a crash.
- **Solution:** Adding `suppressHydrationWarning={true}` to the `<body>` tag tells React to gracefully ignore these externally injected attributes.

## Common Mistakes
- **Assuming Webpack Plugins Run in Turbopack:** Do not assume library auto-injections (like Sentry's) will work when running `--turbopack`. Always verify client initialization manually.

## Revision Checklist
- [ ] I understand why `sentry.client.config.ts` must be manually imported when using Turbopack.
- [ ] I know why `middleware.ts` was renamed to `proxy.ts` in Next.js 16.
- [ ] I can fix browser-extension induced hydration warnings using `suppressHydrationWarning`.

---

# Story: E1-S1 - Owner Registration

## Date

2026-07-23

## Objective

Implement the end-to-end registration flow for business owners using Next.js Server Actions, Supabase Auth, and Drizzle ORM to automatically create an organization and assign the OWNER role, ensuring transaction safety and idempotency.

## What We Built

We implemented a robust server action (`apps/web/app/actions/auth.ts`) that orchestrates the creation of a new user and their initial organization setup:
1. Validates input (`firstName`, `lastName`, `email`, `password`) using Zod.
2. Creates the user via `supabase.auth.signUp`.
3. Opens a Drizzle transaction to generate a unique slug and insert records into `organizations` and `organization_members`.
4. If the database transaction fails, uses a newly created Supabase Admin client (`lib/supabase/admin.ts`) to immediately delete the orphaned Auth user.
We also built a responsive registration UI (`apps/web/app/register/page.tsx` and `register-form.tsx`) using React Hook Form, handling loading states and displaying inline and toast error messages.

## Why We Built It This Way

**Transaction Rollbacks with Supabase Auth:** Unlike a traditional monolithic backend where auth and user tables live in the same database and can be wrapped in a single SQL transaction, Supabase Auth creates the user in the `auth` schema outside our control. If our Drizzle transaction fails (e.g., due to a constraint violation), we are left with an "orphaned" auth user who has no organization. By catching the Drizzle error and using the Supabase Service Role key to delete the user, we guarantee atomic-like consistency without writing complex PL/pgSQL triggers.

**Idempotency & Duplicate Requests:** To prevent issues where a user might double-click the register button or retry after a network timeout, we added an idempotency check inside the Drizzle transaction (`existingMember = await tx.select()...`). If the user already has an organization, we gracefully exit the transaction without attempting to create duplicate records.

**Temporary Organizations:** Because the specific business name and slug aren't collected until the next story (E1-S2), we generated a temporary organization name (`"{firstName} {lastName}'s Business"`) and a unique readable slug (`slugify(name) + counter`). This satisfies the database `NOT NULL` constraints while keeping the URL readable.

## Architecture Decisions

- **Decision:** Use Server Actions for registration instead of API Routes.
  - **Reason:** Provides seamless type safety with Zod, avoids managing fetch state on the client, and allows us to run heavy server-side transactions securely.
- **Decision:** Use a dedicated Supabase Admin client (`createAdminClient`).
  - **Reason:** Administrative actions like deleting a user require the `SUPABASE_SERVICE_ROLE_KEY`. This key must be strictly isolated to prevent accidental exposure to the client.

## Concepts to Master

### Server Actions
- **What it is:** Asynchronous functions executed on the server that can be called directly from Client Components.
- **Why we use it:** Reduces boilerplate, securely accesses database credentials, and handles complex mutations.

### Supabase Admin API
- **What it is:** A subset of the Supabase API accessed via the Service Role Key, bypassing all Row Level Security.
- **Why we need it:** To perform privileged operations like deleting a user (`auth.admin.deleteUser`) which standard users cannot do to themselves without specific RLS policies.

### Slug Generation
- **What it is:** Converting a human-readable string (e.g., "John Doe's Business") into a URL-friendly format ("john-does-business").
- **Why we need it:** To provide readable vanity URLs for public booking pages while ensuring uniqueness via iterative database checks.

## Files to Study

- **`apps/web/app/actions/auth.ts`**: The core registration logic, transaction handling, and slug generation.
- **`apps/web/lib/supabase/admin.ts`**: The isolated, secure admin client factory.
- **`apps/web/app/register/register-form.tsx`**: Client-side form handling and validation with `react-hook-form` and `zod`.

## Common Mistakes

- **Leaking Service Role Key:** Importing `createAdminClient` inside a file marked with `"use client"`. This will instantly expose full database control to the browser.
- **Ignoring Orphaned Records:** Failing to roll back the `auth.users` record if the Drizzle transaction throws an error, leaving the application in an invalid state.

## Where This Will Be Used

- **Epic 1 (Onboarding):** The successful completion of this action redirects the user to the onboarding flow where they will finalize their organization details.

## Revision Checklist

- [ ] I understand why we must delete the Auth user if the Drizzle transaction fails.
- [ ] I can explain why the `SUPABASE_SERVICE_ROLE_KEY` is required for deleting a user.
- [ ] I understand how Server Actions differ from traditional API endpoints.

## Concepts to Master

- **Next.js Instrumentation:** Using `instrumentation.ts` to run code during the Next.js server initialization.
- **Source Map Uploads:** How webpack plugins extract, upload, and then hide `.map` files during a CI/CD build.
- **Edge Runtime limitations:** Understanding how the Edge runtime requires its own lightweight Sentry configuration (`sentry.edge.config.ts`) compared to Node.js.

## Technologies Introduced

- **Sentry SDK (`@sentry/nextjs`)**: Official error tracking SDK for Next.js.
- **Next.js Instrumentation (`instrumentation.ts`)**: Built-in Next.js hook for global server initialization.

## Best Practices

- **Never hardcode DSNs:** Always use environment variables for keys like `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN`.
- **Disable in Dev:** Keep local development clean by disabling Sentry in development.
- **Hide Source Maps:** Always set `hideSourceMaps: true` in production to prevent leaking your source code to the browser.

## Key Takeaways

- Catching errors early and natively at the framework level (via `instrumentation.ts` and `withSentryConfig`) provides the most reliable error tracking for Next.js.
- Our foundation (Epic 0) is now complete: we have UI, Auth, DB, Migrations, CI/CD, and Monitoring.


---

# Story: E1-S1.5 - Authentication Experience Completion

## Date

2026-07-23

## Objective

Polish the authentication experience to ensure a seamless, production-ready journey before advancing to organization onboarding (E1-S2). This includes creating a modern landing page, properly routing authenticated vs. unauthenticated users, improving error handling, and implementing an explicit email verification step.

---

## Prerequisites

- Next.js 15 App Router architecture.
- React Server Components and Client Components.
- Supabase Authentication (Server-Side).
- Zod validation and React Hook Form.

---

## What We Built

We transformed the raw authentication functionality into a complete SaaS user experience:
- **Landing Page (`app/page.tsx`):** A modern, aesthetically pleasing entry point for unauthenticated users, with clear Call To Action (CTA) buttons. Authenticated users are automatically redirected to the internal app router.
- **Route Reorganization:** Moved authentication pages (`login`, `register`, `verify-email`) into an `(auth)` route group with a shared `layout.tsx` for consistent centering and branding.
- **Authentication Router (`app/app/page.tsx`):** A centralized Server Component router that acts as the entry point for authenticated users. It checks if the user belongs to an organization and redirects them to either `/dashboard` or `/onboarding`.
- **Next.js Middleware (`middleware.ts`):** A lightweight route guard that strictly checks for the presence of a Supabase session and enforces basic access control (unauthenticated users to `/login`, authenticated users away from auth routes to `/app`).
- **Normalized Error Handling:** Replaced raw Supabase errors with friendly, actionable error messages (e.g., "An account with this email already exists. Please sign in instead.") and added field-level validation mapping.
- **Manual Email Verification Flow:** Configured the `auth/callback/route.ts` to explicitly log the user out after exchanging the email verification code, forcing them to manually log in. This ensures a consistent, predictable user journey.

---

## Why We Built It This Way

**Centralized App Router (`/app`):** Instead of scattering complex routing logic (like checking organization membership) inside Next.js Middleware or individual pages, we created a single `/app` entry point. Middleware should only answer "Is the user authenticated? Yes/No". The `/app` page handles the "Where should they go based on their business state?" logic. This keeps Middleware fast and maintainable.

**Explicit Email Verification Flow:** While auto-logging users in after clicking an email link is possible, it often creates confusion across different devices or browsers. Forcing a manual login after verification provides a predictable state flow and trains the user to use the login page.

**Route Groups (`(auth)`):** Grouping routes inside parenthesis prevents them from affecting the URL path (so `/(auth)/login` becomes just `/login`), while allowing them to share a common `layout.tsx`. This is perfect for keeping the main application layout separate from the minimalist authentication layout.

---

## Architecture Decisions

- **Decision:** Keep Next.js Middleware strictly focused on session verification (Auth state only).
  - **Reason:** Middleware runs on the Edge and blocks every request. Querying the database to check organization status in Middleware would add latency to every page load.
  - **Trade-offs:** We need an intermediary route (`/app`) to handle the business-logic redirects.
- **Decision:** Use a `PasswordInput` component wrapping a standard `Input`.
  - **Reason:** Separating the show/hide password logic into an isolated component prevents unnecessary re-renders in the parent form and keeps the form code clean.

---

## Concepts to Master

### Next.js Middleware (`middleware.ts`)
- **What it is:** A function that runs before a request is completed, allowing you to modify the response or redirect the user.
- **Why we need it:** To instantly protect private routes (`/dashboard`, `/settings`) without having to write authentication checks in every single Server Component.
- **Where it is used:** `apps/web/middleware.ts` intercepts requests, delegates to Supabase for token refresh, and executes fast redirects.

### Next.js Route Groups `(folderName)`
- **What it is:** A way to logically organize routes and layouts without affecting the URL structure.
- **Why we need it:** We want a specific centered, minimalist layout for Login and Register pages that doesn't include the main application's sidebar or navigation header.

### Zod to React Hook Form Error Mapping
- **What it is:** The process of taking backend validation errors (like "Email already exists") and attaching them directly to the corresponding input field on the frontend.
- **How it works:** Our Server Action returns `fieldErrors` or a general `error`. The client-side form uses `form.setError('fieldName', { message: '...' })` to display the error exactly where the user made the mistake.

---

## Vocabulary

- **Route Guard:** Logic (often in Middleware) that prevents unauthorized access to a page.
- **Idempotency:** An operation that produces the same result no matter how many times it's executed. In authentication, registering an existing email should safely fail with a consistent error rather than crashing the system.
- **Server Action:** An asynchronous function executed on the server, typically triggered by a form submission or button click on the client.

---

## Files to Study

- **`apps/web/middleware.ts` & `apps/web/lib/supabase/middleware.ts`**
  - **Purpose:** Enforces authentication route guards. Notice how it strictly checks `user` existence and avoids querying the database.
- **`apps/web/app/app/page.tsx`**
  - **Purpose:** The business-logic router. Notice how it checks the `organizationMembers` table and redirects accordingly.
- **`apps/web/app/auth/callback/route.ts`**
  - **Purpose:** Handles the email verification code exchange. Notice the explicit `await supabase.auth.signOut()` to enforce the manual login flow.
- **`apps/web/app/(auth)/layout.tsx`**
  - **Purpose:** The shared layout providing the centered, aesthetic wrapper for all authentication forms.

---

## Technologies Introduced

- **Lucide React (`lucide-react`)**: A lightweight, highly customizable SVG icon library. Used here for the `Eye` and `EyeOff` icons in the password input.

---

## Best Practices Learned

- **Never Leak Raw Backend Errors:** Raw errors from tools like Supabase (e.g., `duplicate key value violates unique constraint`) are intimidating and unhelpful to users. Always normalize them into friendly, actionable messages like "An account with this email already exists."
- **Fast Middleware:** Keep Middleware as fast and simple as possible. Defer heavy database queries and complex branching logic to standard Server Components (like our `/app` router).
- **Responsive Layouts:** Even for simple auth forms, use Tailwind classes like `w-full max-w-sm` to ensure the form looks good on both mobile and desktop screens.

---

## Common Mistakes

- **Putting Business Logic in Middleware:** Querying the database to check if a user has an organization inside `middleware.ts` slows down the entire application because it executes on every single route change.
- **Missing Loading States:** Failing to disable the submit button during a network request often leads to users clicking the button multiple times, triggering duplicate API calls.

---

## Where This Will Be Used

- **Epic 1 (Onboarding):** Users will transition smoothly from this polished authentication experience into the organization onboarding flow (E1-S2).
- **Every Application Entry:** This establishes the permanent front door to Arrivo. Every user will interact with these flows and layouts daily.

---

## Common Interview Questions

**Q: Why shouldn't you put database queries or complex business logic inside Next.js Middleware?**
**A:** Middleware executes on every request matching its configuration (often on the Edge). Adding database queries increases latency across the entire application and can exhaust connection pools. Business logic is better handled in Server Components where data fetching is localized to the specific route.

**Q: How do Route Groups `(folder)` help with layouts in Next.js?**
**A:** Route groups allow you to organize files and define shared layouts without altering the URL path. For example, `app/(auth)/login/page.tsx` maps to `/login`, but it will use the `layout.tsx` defined specifically inside the `(auth)` folder, separate from the main application layout.

---

## Exercises

1. **Test the Error Handling:** Attempt to register a new account using an email that you have already registered. Observe how the normalized error message appears on the frontend.
2. **Trace the Middleware Redirect:** Log out, then try to manually navigate to `http://localhost:3000/dashboard` in your browser. Watch the network tab in your developer tools to see how the Next.js Middleware intercepts the request and issues an immediate 307 Temporary Redirect to `/login`.
3. **Inspect the Route Guard:** Log in successfully, then attempt to navigate back to `http://localhost:3000/login`. Observe how you are instantly redirected to `/app`, which then redirects you to your appropriate destination.

---

## Further Reading

- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [React Hook Form Error Handling](https://react-hook-form.com/docs/useform/seterror)

---

## Revision Checklist

- [ ] I understand the difference in responsibility between Next.js Middleware and a Server Component Router (like `/app`).
- [ ] I can explain the purpose of Next.js Route Groups.
- [ ] I know how to normalize a backend error and map it to a frontend input field.
- [ ] I can describe the explicit email verification flow and why we enforce a manual login.

---

## Key Takeaways

- Middleware should be fast and strictly handle authentication boundaries.
- Complex routing and business logic belongs in Server Components.
- A polished SaaS product never exposes raw backend errors to the user.
- Consistent, isolated layouts (via Route Groups) improve maintainability.
