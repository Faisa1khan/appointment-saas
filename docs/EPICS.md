# Epics

> This document breaks down MVP features into epics and stories for sprint planning.
> Stories are written from a product/user perspective, not implementation tasks.
> Epics are ordered by implementation dependency — each epic assumes the previous ones are complete.

---

## Epic 0: Platform Foundation ⭐

**Goal:** Establish the technical foundation before any product feature is built. This epic is developer-facing and can be excluded from product planning.

### Stories

| ID | Story | Priority |
|---|---|---|
| E0-S1 | Initialize Next.js 15 project with TypeScript, Tailwind CSS v4, and shadcn/ui | P0 |
| E0-S2 | Configure Supabase project (Auth, database, storage) and connect to the app | P0 |
| E0-S3 | Configure Drizzle ORM with initial schema and migration pipeline | P0 |
| E0-S4 | Enable RLS on all tenant-scoped tables with correct policies (see Decision 002) | P0 |
| E0-S5 | Configure Vercel deployment with environment variables for staging and production | P0 |
| E0-S6 | Configure error logging and monitoring (e.g. Sentry) | P1 |

---

## Epic 1: Authentication & Onboarding

**Goal:** Allow owners to register, set up their organization, and land on a working dashboard.

### Stories

| ID | Story | Priority |
|---|---|---|
| E1-S1 | As an owner, I can register with email and password | P0 |
| E1-S2 | As an owner, I am prompted to create my organization immediately after registration | P0 |
| E1-S3 | As an owner, I can set my business name, slug, timezone, and booking interval | P0 |
| E1-S4 | As an owner, I can log in and log out | P0 |
| E1-S5 | As an owner, I see an empty dashboard with setup prompts on first login | P1 |
| E1-S6 | As a staff member, I can be invited by the owner and log in | P2 |

---

## Epic 2: Organization Settings ⭐

**Goal:** Allow owners to manage their organization's settings after initial setup. Onboarding creates the org; this epic manages it going forward.

### Stories

| ID | Story | Priority |
|---|---|---|
| E2-S1 | As an owner, I can edit my business name, phone, email, and address | P0 |
| E2-S2 | As an owner, I can change my timezone | P0 |
| E2-S3 | As an owner, I can change my booking interval (15 / 30 / 60 min) | P0 |
| E2-S4 | As an owner, I can set the minimum advance booking time | P0 |
| E2-S5 | As an owner, I can set the customer cancellation cutoff window | P0 |
| E2-S6 | As an owner, I can see my public booking page URL with a one-click copy button | P0 |
| E2-S7 | As an owner, I can upload a business logo | P1 |

---

## Epic 3: Business Configuration

**Goal:** Allow owners to configure when their business is open. The availability engine uses this configuration to generate slots.

> Includes: business hours, holidays, booking interval, and timezone. These are the inputs the availability engine depends on — they live here, not in the engine itself.

### Stories

| ID | Story | Priority |
|---|---|---|
| E3-S1 | As an owner, I can set weekly business hours (open/close time per day of week) | P0 |
| E3-S2 | As an owner, I can mark specific days of the week as closed | P0 |
| E3-S3 | As an owner, I can add specific dates as closures (holidays, emergencies) | P0 |
| E3-S4 | As an owner, I can delete a closure date | P1 |
| E3-S5 | As an owner, I can view upcoming closures in a list | P1 |

---

## Epic 4: Services Management

**Goal:** Allow owners to create and manage the services their business offers.

### Stories

| ID | Story | Priority |
|---|---|---|
| E4-S1 | As an owner, I can add a service with name, duration, and price | P0 |
| E4-S2 | As an owner, I can edit a service | P0 |
| E4-S3 | As an owner, I can deactivate a service (hide it from booking) | P0 |
| E4-S4 | As an owner, I can delete a service with no active bookings | P1 |
| E4-S5 | As an owner, I can add a description to a service | P2 |

---

## Epic 5: Resources Management

**Goal:** Allow owners to add resources (staff, rooms, equipment) that can be assigned to bookings.

### Stories

| ID | Story | Priority |
|---|---|---|
| E5-S1 | As an owner, I can add a resource with a name and optional type | P0 |
| E5-S2 | As an owner, I can edit a resource | P0 |
| E5-S3 | As an owner, I can deactivate a resource | P0 |
| E5-S4 | As an owner, I can set a custom weekly schedule for a resource | P0 |
| E5-S5 | As an owner, I can mark a resource as unavailable on a specific day | P1 |
| E5-S6 | As an owner, I can delete a resource with no future bookings | P1 |

---

## Epic 6: Customer Identity

**Goal:** Manage customer records and identity. Named "Customer Identity" to accommodate future expansions (social login, loyalty accounts) without renaming the epic.

> Covers: guest customers, registered customers, and the guest-to-account linking flow (Decision 003).

### Stories

| ID | Story | Priority |
|---|---|---|
| E6-S1 | As an owner/staff, I can search customers by name or phone | P0 |
| E6-S2 | As an owner/staff, I can create a customer record manually | P0 |
| E6-S3 | As a guest customer, I can book without creating an account | P0 |
| E6-S4 | As a guest customer, I can create an account and see my past bookings linked by verified phone/email | P1 |
| E6-S5 | As an owner/staff, I can view a customer's booking history | P1 |
| E6-S6 | As an owner/staff, I can edit customer details | P1 |

---

## Epic 7: Availability Engine

**Goal:** Backend computes and exposes available booking slots. Uses Business Configuration (Epic 3), Resource schedules (Epic 5), and existing bookings as inputs.

> The frontend never calculates availability. All slot logic lives here.

### Stories

| ID | Story | Priority |
|---|---|---|
| E7-S1 | Backend generates slots using org booking interval, service duration, and business hours | P0 |
| E7-S2 | Backend excludes slots blocked by existing bookings | P0 |
| E7-S3 | Backend uses resource's custom schedule if one exists, falling back to business hours | P0 |
| E7-S4 | Backend returns `BUSINESS_CLOSED` if the requested date is a closure | P0 |
| E7-S5 | Backend excludes slots starting within `min_advance_minutes` from now | P0 |
| E7-S6 | Backend re-validates availability at the moment of booking creation (atomic conflict prevention) | P0 |
| E7-S7 | Frontend always fetches slots from the backend — never calculates locally | P0 |

---

## Epic 8: Bookings

**Goal:** Core booking functionality — create, view, and manage bookings through their full lifecycle.

> Status transitions must strictly follow the documented lifecycle (see ARCHITECTURE.md). Invalid transitions are rejected by the backend.

### Status Lifecycle

```
CONFIRMED → CHECKED_IN → COMPLETED
CONFIRMED → CANCELLED
CONFIRMED → NO_SHOW
```

Any transition not in the above table is rejected with `INVALID_STATUS_TRANSITION`.

### Stories

| ID | Story | Priority |
|---|---|---|
| E8-S1 | As a customer, I can book one or more services at a selected date and time | P0 |
| E8-S2 | As a customer, I receive a booking confirmation page with a reference ID | P0 |
| E8-S3 | As an owner, I can create a booking on behalf of a customer (PHONE or STAFF source) | P0 |
| E8-S4 | As an owner/staff, I can check in a confirmed booking | P0 |
| E8-S5 | As an owner/staff, I can complete a checked-in booking | P0 |
| E8-S6 | As a customer, I can cancel a confirmed booking (subject to cancellation window) | P0 |
| E8-S7 | As an owner, I can cancel any confirmed booking with a reason | P0 |
| E8-S8 | As a customer, I can reschedule a confirmed booking | P0 |
| E8-S9 | As an owner, I can reschedule any confirmed booking | P0 |
| E8-S10 | As an owner/staff, I can mark a confirmed booking as no-show | P0 |
| E8-S11 | Booking status transitions follow the documented lifecycle — invalid transitions are rejected | P0 |
| E8-S12 | Booking services are snapshotted at time of booking (price/name changes don't affect history) | P0 |
| E8-S13 | As an owner/staff, I can assign or change the resource on a confirmed booking | P1 |
| E8-S14 | As an owner, I can add internal notes to a booking | P1 |

---

## Epic 9: Walk-ins

**Goal:** Allow owners and staff to handle customers who walk in without a prior appointment.

> Walk-ins are bookings with `source = WALK_IN` and follow the same lifecycle as regular bookings (Decision 001).

### Stories

| ID | Story | Priority |
|---|---|---|
| E9-S1 | As an owner/staff, I can create a walk-in booking in under 30 seconds | P0 |
| E9-S2 | As an owner/staff, I can view all walk-in bookings for today | P0 |
| E9-S3 | Walk-in bookings follow the same check-in → complete lifecycle as regular bookings | P0 |
| E9-S4 | As an owner/staff, I can assign a resource to a walk-in after creation | P1 |

---

## Epic 10: Public Booking Page

**Goal:** Give customers a fast, mobile-friendly page to book services without an account.

### Stories

| ID | Story | Priority |
|---|---|---|
| E10-S1 | Business has a public booking URL at `/{slug}` | P0 |
| E10-S2 | Page shows business name, active services, and a booking form | P0 |
| E10-S3 | Customer can select multiple services | P0 |
| E10-S4 | Customer selects a date and sees available time slots | P0 |
| E10-S5 | Customer enters name and phone to complete booking | P0 |
| E10-S6 | Customer sees a confirmation page after booking | P0 |
| E10-S7 | Customer can look up their existing bookings by phone number on the booking page | P0 |
| E10-S8 | Page is fast and mobile-first | P0 |

---

## Epic 11: Owner Dashboard

**Goal:** Give owners a clear operational view of their daily bookings and business status.

> For MVP this is the Operations Dashboard. A separate Reporting Dashboard is a future epic.

### Stories

| ID | Story | Priority |
|---|---|---|
| E11-S1 | As an owner, I can see all of today's bookings sorted by time | P0 |
| E11-S2 | As an owner, I can see walk-in bookings separately from scheduled bookings | P0 |
| E11-S3 | As an owner, I can take quick actions (check in, complete, cancel, no-show) from the dashboard | P0 |
| E11-S4 | As an owner, I can navigate to any date to view bookings for that day | P0 |
| E11-S5 | As an owner, I can see my public booking URL with a copy button on the dashboard | P0 |
| E11-S6 | As an owner, I can see which resources are free right now | P1 |
| E11-S7 | As an owner, I can filter today's bookings by resource | P1 |
| E11-S8 | As an owner, I can view upcoming bookings for the next 7 days | P2 |

---

## Epic 12: Notifications

**Goal:** Notify customers via WhatsApp (primary) and email (fallback) at key booking lifecycle events.

> V1 covers booking confirmation only. Reminders and follow-ups are P1 and can ship post-launch.

### Stories

| ID | Story | Priority |
|---|---|---|
| E12-S1 | Customer receives a WhatsApp confirmation message when a booking is created | P0 |
| E12-S2 | Customer receives a confirmation email if they have no phone but provided an email | P0 |
| E12-S3 | Notification failures do not block booking creation (fire-and-forget) | P0 |
| E12-S4 | Customer receives a WhatsApp reminder 24 hours before their appointment | P1 |
| E12-S5 | Customer receives a WhatsApp message when their booking is cancelled | P1 |
| E12-S6 | Customer receives a WhatsApp message when their booking is rescheduled | P1 |
| E12-S7 | Owner receives a WhatsApp notification when a customer cancels online | P2 |
| E12-S8 | Customer receives a no-show follow-up message after a missed appointment | P2 |

---

## Epic Order & Dependencies

```
Epic 0 (Platform Foundation)
  ↓
Epic 1 (Authentication)
  ↓
Epic 2 (Organization Settings)
  ↓
Epic 3 (Business Configuration)
  ↓
Epic 4 (Services) + Epic 5 (Resources)        ← parallel
  ↓
Epic 6 (Customer Identity)
  ↓
Epic 7 (Availability Engine)
  ↓
Epic 8 (Bookings)
  ↓
Epic 9 (Walk-ins) + Epic 10 (Public Booking)  ← parallel
  ↓
Epic 11 (Dashboard)
  ↓
Epic 12 (Notifications)
```

---

## Priority Definitions

| Priority | Meaning |
|---|---|
| P0 | Must have for MVP launch |
| P1 | Should have — important but not blocking launch |
| P2 | Nice to have — can be deferred to first post-launch iteration |
