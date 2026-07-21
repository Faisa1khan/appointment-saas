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
