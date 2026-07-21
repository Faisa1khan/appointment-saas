# Tech Stack

## Frontend

| Layer | Tool | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15 |
| UI Library | React | 19 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui | latest |
| Forms | React Hook Form | latest |
| Validation | Zod | latest |

## Backend

| Layer | Tool | Notes |
|---|---|---|
| API | Next.js Route Handlers | REST endpoints under `/api/v1` |
| Server Logic | Server Actions | Used for form mutations where appropriate |

## Database

| Layer | Tool | Notes |
|---|---|---|
| Database | PostgreSQL | Managed by Supabase |
| Platform | Supabase | Auth, RLS, Storage, Realtime |
| ORM | Drizzle ORM | Schema-first, type-safe queries |

## Authentication

| Layer | Tool | Notes |
|---|---|---|
| Auth Provider | Supabase Auth | Email/password for owners; Phone OTP or email for customers |

## Validation

| Layer | Tool | Notes |
|---|---|---|
| Schema Validation | Zod | Used on both client and server |

## Messaging

| Layer | Tool | Purpose |
|---|---|---|
| WhatsApp (Primary) | Meta WhatsApp Cloud API | Booking confirmations, sent via platform WhatsApp Business number on behalf of each org |
| Email (Fallback) | Resend | Sent only when customer has no phone / as secondary channel |

**WhatsApp Notes:**
- The platform registers one WhatsApp Business Account. All tenants share the platform's number.
- Messages are branded per org: *"Your booking at Amir Barber Shop is confirmed."*
- Business-initiated messages (sent by the platform without the customer messaging first) **must use Meta-approved message templates**. Templates are submitted to Meta for approval before going live.
- Customers receive WhatsApp messages to the phone number they provided at booking.
- Free tier: first 1,000 conversations/month per WhatsApp Business Account.
- Required env vars: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `META_WEBHOOK_VERIFY_TOKEN`

## Deployment

| Layer | Tool | Notes |
|---|---|---|
| Hosting | Vercel | Serverless Next.js deployment |
| Database Hosting | Supabase Cloud | Managed PostgreSQL |

## Package Manager

- **pnpm** — Required. Do not use npm or yarn.

## Conventions

- TypeScript only. No `.js` files.
- Prefer Server Components. Use Client Components only when required (interactivity, browser APIs).
- All environment variables prefixed with `NEXT_PUBLIC_` are client-safe. All others are server-only.
- Drizzle schema is the source of truth for the database. Never modify the database without updating `DATABASE.md` and the Drizzle schema.