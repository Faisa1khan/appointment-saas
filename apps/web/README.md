# Arrivo — `apps/web`

> Multi-tenant booking and reservation platform for service businesses.

---

## Overview

Arrivo is a SaaS platform that enables businesses of all kinds — salons, clinics, gyms, restaurants — to accept online bookings, manage walk-ins, and run their daily operations from a single dashboard.

This package (`apps/web`) is the main Next.js application.

---

## Tech Stack

| Layer | Tool | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15 |
| UI Library | React | 19 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui | latest |
| Forms | React Hook Form | latest |
| Validation | Zod | latest |
| Theme | next-themes | latest |

---

## Installation

> **Requires pnpm.** Do not use npm or yarn.

```bash
# From the repo root
pnpm install
```

---

## Development

```bash
cd apps/web
pnpm dev        # starts Next.js with Turbopack at http://localhost:3000
```

---

## Build

```bash
pnpm build      # production build
pnpm start      # serve the production build
```

---

## Lint

```bash
pnpm lint       # ESLint with eslint-config-next
```

---

## Type Check

```bash
pnpm typecheck  # tsc --noEmit
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `WHATSAPP_PHONE_NUMBER_ID` | Yes | Meta WhatsApp Cloud API phone number ID |
| `WHATSAPP_ACCESS_TOKEN` | Yes | Meta WhatsApp Cloud API access token |
| `META_WEBHOOK_VERIFY_TOKEN` | Yes | Meta webhook verification token |
| `WHATSAPP_TEMPLATE_NAME` | Yes | WhatsApp message template name |
| `WHATSAPP_TEMPLATE_LANGUAGE` | Yes | WhatsApp template language code |
| `RESEND_API_KEY` | Yes | Resend API key (email fallback) |

> Variables prefixed with `NEXT_PUBLIC_` are safe to expose to the browser. All others are server-only.

---

## Project Structure

```
apps/web/
├── app/                  # Next.js App Router pages and layouts
│   ├── globals.css       # Tailwind v4 theme tokens and base styles
│   ├── layout.tsx        # Root layout (metadata, fonts, providers)
│   └── page.tsx          # Home page
├── components/
│   ├── providers.tsx     # Client-side context providers (ThemeProvider, etc.)
│   └── ui/               # shadcn/ui components
├── lib/
│   └── utils.ts          # cn() utility (clsx + tailwind-merge)
├── public/               # Static assets
├── components.json       # shadcn/ui configuration
├── next.config.ts        # Next.js configuration
├── postcss.config.mjs    # PostCSS (Tailwind v4)
└── tsconfig.json         # TypeScript configuration (strict mode)
```
