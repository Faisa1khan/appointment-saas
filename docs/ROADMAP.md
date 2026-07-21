# Roadmap

> This roadmap reflects the planned product evolution.
> Scope is defined in PRD.md. Architecture decisions are in DECISIONS.md.

---

## Version 1 — MVP (Current Focus)

**Goal:** Launch a working multi-tenant booking platform for service businesses.

**Modules:**
- Platform foundation (Epic 0)
- Owner registration and organization setup
- Business hours and closure management
- Services management
- Resources management with custom schedules
- Public booking page (customer self-serve)
- Backend availability engine
- Booking lifecycle (create, check-in, complete, cancel, no-show, reschedule)
- Walk-in bookings
- Customer records with guest-to-account linking
- Owner & staff dashboard
- Supabase Auth + RLS multi-tenancy

**Exit Criteria:**
- A salon or clinic owner can onboard and accept bookings in under 10 minutes.
- Double booking is impossible.
- Public booking page works on mobile.

---

## Version 2 — Enhanced Operations & Ordering

**Goal:** Improve day-to-day operational tools, add restaurant support, and enable takeaway orders.

**Modules:**
- QR code check-in (customer scans on arrival)
- Restaurant table reservations
- Table management (floor plan view)
- Takeaway (self-ordering / click-and-collect) — customer places an order online, comes in and picks it up; no rider or delivery involved
- Basic customer-facing booking management (view, reschedule, cancel via link)
- Staff invite and role management

> **Note:** Takeaway is in-scope for V2. Home Delivery (which requires rider assignment and live tracking) is deferred to V4.

---

## Version 3 — Monetization & Communication

**Goal:** Add revenue features and customer communication.

**Modules:**
- Payments and deposits (Stripe integration)
- Notification system (SMS/email reminders, booking confirmations)
- No-show fee collection
- Basic analytics (bookings per day, revenue, resource utilization)
- Customer booking history in account portal

---

## Version 4 — Home Services & Delivery

**Goal:** Expand into logistics-heavy service categories that require dispatch, rider management, and live tracking.

**Modules:**
- Home service booking (technician dispatched to customer address)
- Home delivery (rider assignment, pickup, last-mile delivery)
- Live tracking (rider/technician location in real time)
- Waitlist (notify customer when a cancelled slot opens)
- Customer preference management (preferred resource, preferred time)
- Recurring bookings
- AI booking assistant
- Advanced analytics and reports

> **Note:** Home Delivery is intentionally deferred to this version. It requires a full rider management flow, dispatch logic, live tracking, and delivery status transitions — none of which are needed for online bookings, walk-ins, or takeaway.

---

## Deferred (No Planned Version)

Features not currently planned:

- Loyalty and rewards
- Franchise / multi-location management
- Marketplace (discovery of businesses on the platform)
- Calendar sync (Google, Apple)
- Reviews and ratings