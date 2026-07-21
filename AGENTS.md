# AGENTS.md

This file defines the engineering standards for this repository.

Every AI agent working on this project MUST follow these rules.

---

# Project

Generic Multi-Tenant Appointment Booking SaaS

---

# Tech Stack

Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- React Hook Form
- Zod

Backend

- Next.js Route Handlers
- Server Actions where appropriate

Database

- PostgreSQL
- Supabase

Authentication

- Supabase Auth

ORM

- Drizzle ORM

Validation

- Zod

Deployment

- Vercel

Package Manager

- pnpm

---

# Coding Rules

- Use TypeScript only.
- Never use JavaScript files.
- Prefer Server Components.
- Use Client Components only when necessary.
- Keep components small and reusable.
- Avoid unnecessary abstraction.
- Prefer composition over inheritance.

---

# UI Rules

- Use shadcn/ui components.
- Do not install another UI library.
- Use Tailwind utilities.
- Maintain consistent spacing.
- Mobile-first responsive design.

---

# Database Rules

- Never modify the schema without updating DATABASE.md.
- Follow naming conventions.
- Use UUID primary keys.
- Use foreign keys.
- Use timestamps.

---

# API Rules

- Follow API.md.
- Do not invent endpoints.
- Validate every request with Zod.
- Return consistent error responses.

---

# Business Rules

Always follow:

- PRD.md
- ARCHITECTURE.md
- USER_FLOWS.md
- SCENARIOS.md
- DATABASE.md

Do not make assumptions.

If documentation is unclear:

STOP

Ask for clarification instead of implementing.

---

# Architecture

The system is API-first.

Business logic belongs in the backend.

The frontend should never calculate booking availability.

Availability is always computed by the backend.

---

# Design Principles

Keep the MVP simple.

Prefer configuration over complexity.

Build generic solutions.

Avoid industry-specific code.

Never optimize prematurely.

---

# Before Writing Code

Verify:

- Is the feature documented?
- Does it match the architecture?
- Does it follow the database design?
- Does it follow the business rules?

If not, update the documentation first.

Documentation is the source of truth.


# Implementation Workflow

Before implementing any feature, follow this order:

1. Read AGENTS.md
2. Read STACK.md
3. Read ARCHITECTURE.md
4. Read PRD.md
5. Read DATABASE.md
6. Read API.md
7. Read USER_FLOWS.md
8. Implement the feature
9. If documentation and code conflict, documentation wins.
10. Never introduce new libraries or architectural patterns without approval.