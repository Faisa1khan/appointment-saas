# Architectural Decisions

---

## Decision 001

**Title:** Walk-ins are Bookings

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
Walk-ins use the `bookings` entity with `source = WALK_IN`.

**Reason:**
Avoid duplicate models and keep the booking engine generic. Walk-ins go through the same lifecycle as regular bookings (CONFIRMED → CHECKED_IN → COMPLETED).

---

## Decision 002

**Title:** Multi-Tenancy via Supabase Row-Level Security (RLS)

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
All tenant-scoped tables include an `organization_id` column. Supabase Row-Level Security (RLS) policies are applied to every tenant-scoped table to enforce data isolation at the database level.

**Reason:**
RLS provides a hard security boundary enforced by the database, not the application. This prevents data leakage even if application-level bugs exist. RLS policies check `organization_id` against the authenticated user's organization membership.

**Implementation Notes:**
- Every tenant-scoped table has `organization_id uuid NOT NULL REFERENCES organizations(id)`.
- RLS is enabled on all tenant-scoped tables.
- Policies use the `auth.uid()` function provided by Supabase to validate that the requesting user is a member of the `organization_id` in the row.
- Service-role key (used in server-side route handlers) bypasses RLS and must be used only in trusted server environments.

---

## Decision 003

**Title:** Guest Booking with Account Linking

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
Customers can book as guests using only their phone number or email address. If a guest later registers an account using the same verified phone number or email address, their historical guest bookings are automatically linked to the new account.

**Reason:**
Reduces friction for customers who don't want to register upfront. Linking via verified contact details preserves booking history after account creation without requiring manual migration.

**Implementation Notes:**
- Guest bookings create a `customer` record with `user_id = NULL`.
- When a new user registers, the system looks for existing `customer` records in the same organization where `phone` or `email` matches the verified contact.
- If found, the `user_id` on the matching customer record is updated to the new user's id.
- Matching is only performed on verified contacts (phone OTP or email confirmation).

---

## Decision 004

**Title:** Queue Management is Out of Scope for MVP

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
A dedicated queue management system is out of scope for the MVP. Walk-in customers are created as bookings with `source = WALK_IN`. The owner/staff manage walk-ins by viewing bookings filtered by source.

**Reason:**
A full queue system (estimated wait times, capacity rules, customer notifications) adds complexity that is not needed for an MVP. The walk-in booking model is sufficient for initial operations.

**Future:**
Queue capacity rules, max queue size enforcement, and estimated wait time calculations are deferred to a future version.

---

## Decision 005

**Title:** Backend-Generated Booking Slots

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
Available booking slots are always computed by the backend. The frontend never calculates availability. The backend generates slots using the following inputs:

1. Organization booking interval (e.g. every 15 or 30 minutes)
2. Service duration
3. Business hours for the requested date
4. Resource availability schedule for the requested date
5. Existing bookings for that resource on that date

**Reason:**
Centralized availability logic prevents double-booking, ensures consistency, and makes it impossible for the frontend to display incorrect slots.

**Implementation Notes:**
- Each organization has a configurable `booking_interval` (in minutes). Default: 30.
- Slots are generated at each interval boundary that can fit the total service duration before the end of business hours.
- A slot is valid if: the resource is available, business is open, and no existing booking overlaps the proposed time range.
- Availability is re-validated at the moment of booking creation (optimistic concurrency check).

---

## Decision 006

**Title:** Resource Assignment — Manual First, Auto Optional

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
The default assignment mode is manual. Owners or staff assign a resource to each booking. The system optionally supports automatic assignment to the first available resource when the owner does not specify one.

**Reason:**
Most service businesses prefer to control which staff member or asset handles a booking. Automatic assignment is a convenience feature, not the default.

**Implementation Notes:**
- `resource_id` on a booking is nullable; it can be assigned after booking creation.
- When `resource_id` is not provided and auto-assignment is requested, the backend selects the first resource that is available for the full duration of the requested services on the requested date/time.
- Advanced strategies (round-robin, load balancing, preference matching) are future enhancements.

---

## Decision 007

**Title:** Guest Booking Lookup by Phone Number

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
A public endpoint (`GET /organizations/:orgId/bookings/lookup?phone=`) allows guest customers to retrieve their active (CONFIRMED, CHECKED_IN) bookings by entering their phone number. No account or authentication is required.

**Reason:**
Without a notification system in V1, guest customers have no way to retrieve their booking after closing the confirmation page. A phone-based lookup is simple, requires no new infrastructure, and solves the real user need. Only active bookings are returned — completed and cancelled bookings are not needed for guest lookup.

**Implementation Notes:**
- The endpoint returns an empty result (not a 404) when no match is found, to avoid leaking whether a phone number exists in the system.
- The endpoint must be rate-limited (e.g. 10 requests per phone number per 15 minutes) to prevent abuse.
- Requires no changes to the database schema.

---

## Decision 008

**Title:** Minimum Advance Booking Time (Per Organization)

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
Each organization has a configurable `min_advance_minutes` field (integer, default `0`). Slots that start within this window from "now" are excluded from availability results. The backend enforces this rule both at slot generation time and at booking creation time.

**Reason:**
Businesses need to prevent last-minute same-minute bookings. A restaurant cannot accept a table reservation starting in 5 minutes. A salon may need at least 30 minutes to prepare. `0` means no restriction, maintaining backward compatibility for businesses that want immediate bookings.

**Implementation Notes:**
- Stored on the `organizations` table as `min_advance_minutes integer NOT NULL DEFAULT 0`.
- Applied in the availability engine before returning slots.
- Also enforced at booking creation: if `start_time` is within `min_advance_minutes` of `now()` (in the org's timezone), return `ADVANCE_BOOKING_TOO_SOON`.
- Walk-in and staff-created bookings (source ≠ ONLINE) bypass this rule — staff can always create immediate bookings.

---

## Decision 009

**Title:** Customer Cancellation Cutoff Window (Per Organization)

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
Each organization has a configurable `cancellation_cutoff_hours` field (integer, default `0`). If a customer attempts to self-cancel a booking and the booking's start time is within this many hours from now, the cancellation is rejected with `CANCELLATION_WINDOW_CLOSED`. Owner and staff can always cancel any booking regardless of this window.

**Reason:**
Businesses lose revenue when customers cancel at the last minute after the business has already prepared or reserved the resource. A cutoff window gives businesses a simple policy to protect against this.

**Implementation Notes:**
- Stored on the `organizations` table as `cancellation_cutoff_hours integer NOT NULL DEFAULT 0`.
- `0` means no restriction — customers can cancel at any time up to the booking start.
- Only applies to customer-initiated cancellations. Owner/staff cancellations are never restricted by this rule.

---

## Decision 010

**Title:** WhatsApp as Primary Confirmation Channel; Email as Fallback (V1)

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
When a booking is created, the system sends a confirmation message via WhatsApp to the customer's phone number (primary). If the customer has no phone number but provided an email, a confirmation email is sent via Resend (fallback). Both channels are fire-and-forget — neither blocks booking creation if they fail.

**Reason:**
WhatsApp has near-universal adoption in target markets (South Asia, Middle East, Africa). Open rates on WhatsApp are significantly higher than email (90%+ vs ~20%). Customers expect real-time confirmation via the channel they already use daily. Email is retained as a fallback for customers who provide an email but no phone.

**Channel Priority:**
1. **WhatsApp** — if `customer.phone` is present → send WhatsApp template message
2. **Email** — if `customer.email` is present and phone is absent → send email via Resend
3. **None** — if neither is present → no confirmation sent (edge case; the booking confirmation page is always shown)

**Implementation Notes:**
- Triggered from the booking creation Route Handler after the booking is successfully persisted.
- Both calls are fire-and-forget. If either fails, the booking is unaffected.
- WhatsApp message uses a Meta-approved template. See Decision 011 for details.
- Email content: business name, date/time, services, resource (if assigned), phone lookup link.

---

## Decision 011

**Title:** WhatsApp Cloud API Architecture for Multi-Tenant SaaS

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
The platform uses the **Meta WhatsApp Cloud API** (Meta's official hosted API) with a single platform-level WhatsApp Business Account. All tenant organizations share the platform's WhatsApp phone number. Messages are branded with the organization's name inside the message body.

**Reason:**
- Meta WhatsApp Cloud API is free, official, and requires no third-party intermediary.
- A shared platform-level account is the simplest architecture for a multi-tenant SaaS in V1. Per-tenant WhatsApp numbers require each business to own a WhatsApp Business Account, which adds onboarding friction and is a V2+ enhancement.
- First 1,000 conversations/month are free. Each unique customer conversation (24-hour window) counts as one conversation.

**Template Message Requirement:**
Business-initiated WhatsApp messages (sent without the customer messaging first) **must use pre-approved Meta message templates**. Free-form messages are only allowed within a 24-hour window after the customer messages the platform first.

For booking confirmation, the platform must submit a template to Meta for approval before launch. Example template:

```
Hello {{1}}, your booking at {{2}} is confirmed for {{3}} at {{4}}.
Services: {{5}}.
To view or cancel your booking, visit: {{6}}
```

Variables: customer name, business name, date, time, services list, booking lookup URL.

**Environment Variables (server-only):**
```
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
META_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_TEMPLATE_NAME=booking_confirmation
WHATSAPP_TEMPLATE_LANGUAGE=en
```

**Implementation Notes:**
- API endpoint: `POST https://graph.facebook.com/v19.0/{phone-number-id}/messages`
- Authentication: `Authorization: Bearer {WHATSAPP_ACCESS_TOKEN}`
- Message type: `template` with `components` for variable substitution.
- The webhook (`META_WEBHOOK_VERIFY_TOKEN`) is needed to verify the Meta webhook endpoint during setup but is not used for outbound messages.
- Full WhatsApp notification system (booking reminders 24h before, no-show follow-up, cancellation alerts) is deferred to V3. V1 sends only the booking confirmation message.

---

## Decision 012

**Title:** API Split — Public vs Owner, No organizationId in URL

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
The API is split into two namespaces:
- `/api/v1/public/{slug}/*` — Public endpoints. No auth. Organization resolved from slug.
- `/api/v1/owner/*` — Authenticated endpoints. Organization resolved from the user's JWT session via `organization_members`.

No authenticated endpoint includes `organizationId` in the URL path.

**Reason:**
Embedding `organizationId` in every authenticated URL is redundant. The org is already known from the JWT. Removing it makes URLs shorter and cleaner, eliminates a class of authorization bugs (a user passing another org's ID), and makes the API more ergonomic. Public endpoints use `slug` because they are accessed without a session.

**Implementation Notes:**
- All owner Route Handlers must call a `getOrganizationFromSession()` helper that resolves org from `auth.uid()` via `organization_members`.
- If the user is not a member of any org, return `403 FORBIDDEN`.
- The slug for public endpoints is looked up via `organizations.slug`.

---

## Decision 013

**Title:** Human-Friendly Booking Reference

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
Every booking has a `reference` field in addition to its UUID `id`. Format: `BK-YYYYMMDD-NNNNNN` (e.g. `BK-20260720-000042`). The reference is unique within an organization and generated by the application at booking creation time.

**Reason:**
UUIDs are not usable in human conversations. When a customer calls to ask about their booking, they cannot read a UUID to the business owner. A short, date-prefixed reference (e.g. `BK-20260720-000042`) is memorable, easy to communicate, and makes support much easier.

**Implementation Notes:**
- Stored in `bookings.reference` as `text NOT NULL`.
- Unique constraint: `UNIQUE (organization_id, reference)`.
- Generation strategy: `BK-` + `YYYYMMDD` (booking date in org timezone) + `-` + zero-padded 6-digit daily counter per org. If the counter approach is complex, a random 6-character alphanumeric suffix is acceptable as a simpler alternative.
- The `reference` is always returned alongside `id` in all booking responses.

---

## Decision 014

**Title:** POST /search for Complex Booking Queries

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
Booking list queries are handled by `POST /api/v1/owner/bookings/search` with a JSON request body, not `GET` with query parameters.

**Reason:**
Booking search involves multiple optional filters (date range, status array, source array, resource, customer). As the product evolves, these filters will grow. A `GET` endpoint with many query parameters becomes unwieldy and hard to document. A `POST /search` body is easier to extend, supports arrays naturally in JSON, and is self-documenting.

**Implementation Notes:**
- All filter fields are optional.
- The endpoint returns a paginated list with `meta.total`, `meta.page`, `meta.limit`, `meta.sort`, `meta.order`.
- This pattern should be applied to any future list endpoint where filtering complexity is expected to grow.

---

## Decision 015

**Title:** Standardized Pagination

**Date:** 2026-07-20

**Status:** Accepted

**Decision:**
All paginated endpoints use the same four parameters: `page`, `limit`, `sort`, `order`. All responses include a `meta` object with `total`, `page`, `limit`, `sort`, `order`.

| Param | Default | Notes |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `20` | Results per page, max `100` |
| `sort` | `created_at` | Column to sort by |
| `order` | `desc` | `asc` or `desc` |

**Reason:**
Consistent pagination across all list endpoints reduces frontend complexity. Developers only learn one pattern. `limit` is preferred over `per_page` for conciseness and industry convention.