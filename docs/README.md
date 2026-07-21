# Appointment SaaS

A generic, multi-tenant booking platform for service businesses.

---

## What This Is

A SaaS platform that allows service businesses (salons, clinics, gyms, spas, coworking spaces, sports venues, and more) to:

- Accept online bookings from customers
- Manage walk-in customers
- Track resources and staff availability
- Run their daily operations from a dashboard

---

## Documentation

Read the docs in this order before writing any code:

| File | Purpose |
|---|---|
| [AGENTS.md](../AGENTS.md) | Engineering rules all agents must follow |
| [docs/VISION.md](docs/VISION.md) | Product vision and principles |
| [docs/STACK.md](docs/STACK.md) | Tech stack with versions |
| [docs/PRD.md](docs/PRD.md) | Product requirements, personas, user stories |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, concepts, and business rules |
| [docs/DATABASE.md](docs/DATABASE.md) | Full database schema |
| [docs/API.md](docs/API.md) | REST API design (all endpoints) |
| [docs/USER_FLOWS.md](docs/USER_FLOWS.md) | Step-by-step user flows |
| [docs/SCENARIOS.md](docs/SCENARIOS.md) | Business scenarios and edge cases |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architectural decisions and reasoning |
| [docs/EPICS.md](docs/EPICS.md) | Feature epics and stories for sprint planning |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Product versioning and future plans |

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js Route Handlers
- **Database:** PostgreSQL via Supabase, Drizzle ORM
- **Auth:** Supabase Auth
- **Deployment:** Vercel

See [docs/STACK.md](docs/STACK.md) for full details.

---

## Repository Structure

```
appointment-saas/
├── apps/
│   └── web/          # Next.js 15 app
├── packages/
│   └── db/           # Drizzle ORM schema and migrations
├── supabase/         # Supabase config and migrations
├── docs/             # All product and technical documentation
└── AGENTS.md         # Engineering rules for all agents
```

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm
- Supabase CLI
- A Supabase project

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local
# Fill in your Supabase URL and anon key

# Start local Supabase (optional)
supabase start

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

### Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# WhatsApp Cloud API (Meta) — primary confirmation channel
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
META_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_TEMPLATE_NAME=booking_confirmation
WHATSAPP_TEMPLATE_LANGUAGE=en

# Resend — email fallback (when customer has no phone)
RESEND_API_KEY=
```

---

## Development Rules

- Use TypeScript only. No `.js` files.
- Prefer Server Components.
- Use pnpm. Not npm or yarn.
- Never modify the database without updating `docs/DATABASE.md`.
- Follow the API contract in `docs/API.md`. Do not invent endpoints.
- Business logic belongs in the backend. The frontend never calculates availability.

See [AGENTS.md](AGENTS.md) for the full rules.
