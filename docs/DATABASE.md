# Database Schema

> Before modifying this file, read AGENTS.md, ARCHITECTURE.md, and DECISIONS.md.
> Never modify the database without updating this file and the Drizzle schema.

---

## Conventions

### Naming

| Rule | Example |
|---|---|
| Table names are **plural** | `bookings`, `organizations`, `customers` |
| Primary key is always `id` | `id uuid PK` |
| Foreign keys use `<entity>_id` | `organization_id`, `customer_id`, `resource_id` |
| Boolean columns start with `is_` | `is_active`, `is_closed`, `is_unavailable` |
| Timestamp columns end with `_at` | `created_at`, `updated_at`, `checked_in_at` |
| Enum types are singular and snake_case | `booking_status`, `booking_source`, `member_role` |

### Audit Fields

Unless otherwise noted, all mutable tables include:

```
created_at  timestamptz  NOT NULL  DEFAULT now()
updated_at  timestamptz  NOT NULL  DEFAULT now()
```

Immutable tables (e.g. `booking_services`, `business_closures`) include only `created_at`.

### Delete Behavior

| Pattern | When to use | Example |
|---|---|---|
| `ON DELETE CASCADE` | Child has no meaning without parent | `bookings → organizations` |
| `ON DELETE SET NULL` | Reference may disappear; history must be preserved | `booking_services.service_id → services` |
| `ON DELETE RESTRICT` | Deletion should be blocked (not used in MVP) | — |

- Parent entities cascade to all owned children.
- Historical snapshot records (`booking_services`) use `SET NULL` on the source reference to preserve the snapshot even after the source is deleted.
- No soft deletes in MVP. Records are hard-deleted or deactivated via an `is_active` / status flag.

### Data Types

- **UUIDs**: All primary keys use `uuid` with `gen_random_uuid()`.
- **Monetary values**: `integer` (smallest currency unit — cents, paise, fils). Never `float` or `decimal`.
- **Time**: `time` (HH:MM:SS) for times of day. `date` for calendar dates. `timestamptz` for absolute timestamps.
- **Text**: `text` for all variable-length strings unless a specific max length must be enforced.

---

## Enum Types

```sql
CREATE TYPE booking_source AS ENUM ('ONLINE', 'WALK_IN', 'PHONE', 'STAFF');
CREATE TYPE booking_status AS ENUM ('CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE member_role    AS ENUM ('OWNER', 'STAFF');
```

---

## Tables

---

### `organizations`

A business registered on the platform.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `name` | `text` | NOT NULL | Display name of the business |
| `slug` | `text` | NOT NULL, UNIQUE | URL-safe identifier (e.g. `amir-barber`) |
| `phone` | `text` | | Business contact phone |
| `email` | `text` | | Business contact email |
| `address` | `text` | | Physical address |
| `timezone` | `text` | NOT NULL, DEFAULT `'Asia/Kolkata'` | IANA timezone string (e.g. `Asia/Karachi`) |
| `currency_code` | `text` | NOT NULL, DEFAULT `'INR'` | ISO 4217 currency code (e.g. `USD`, `INR`, `EUR`) |
| `locale` | `text` | NOT NULL, DEFAULT `'en-IN'` | Locale for formatting (e.g. `en-US`, `en-IN`, `de-DE`) |
| `week_starts_on` | `smallint` | NOT NULL, DEFAULT `1` | 0 = Sunday, 1 = Monday, etc. |
| `booking_interval` | `integer` | NOT NULL, DEFAULT `30` | Slot generation interval in minutes (e.g. 15, 30, 60) |
| `min_advance_minutes` | `integer` | NOT NULL, DEFAULT `0` | Minimum minutes in advance a booking must be made. `0` = no restriction. e.g. `60` = must book at least 1 hour ahead |
| `cancellation_cutoff_hours` | `integer` | NOT NULL, DEFAULT `0` | Hours before booking start within which a customer can no longer self-cancel. `0` = no restriction. Owner/staff can always cancel. |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- `UNIQUE (slug)`

**RLS:** Not tenant-scoped. Accessible to authenticated users who are members.

---

### `organization_members`

Links Supabase Auth users to organizations with a role.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `organization_id` | `uuid` | NOT NULL, FK → `organizations(id)` ON DELETE CASCADE | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | Supabase Auth user |
| `role` | `member_role` | NOT NULL | `OWNER` or `STAFF` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- `UNIQUE (organization_id, user_id)`
- Index on `user_id`

**RLS:** Users can only see rows where `user_id = auth.uid()`.

---

### `customers`

A person who makes bookings at an organization.

Customers are scoped to an organization. The same person can be a customer at multiple organizations.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `organization_id` | `uuid` | NOT NULL, FK → `organizations(id)` ON DELETE CASCADE | |
| `user_id` | `uuid` | NULLABLE, FK → `auth.users(id)` ON DELETE SET NULL | NULL for guests; set when linked to an account |
| `name` | `text` | NOT NULL | |
| `phone` | `text` | | At least one of phone or email must be present |
| `email` | `text` | | |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- Index on `(organization_id, phone)`
- Index on `(organization_id, email)`
- Index on `user_id`

**Constraints:**
- `CHECK (phone IS NOT NULL OR email IS NOT NULL)` — At least one contact required.

**RLS:** Readable/writable by members of the same organization.

---

### `service_categories`

A logical grouping of services (e.g. "Haircuts", "Coloring").

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `organization_id` | `uuid` | NOT NULL, FK → `organizations(id)` ON DELETE CASCADE | |
| `name` | `text` | NOT NULL | Display name |
| `slug` | `text` | NOT NULL | URL-safe identifier |
| `color` | `text` | | Predefined palette color |
| `display_order` | `integer` | NOT NULL, DEFAULT `0` | Controls ordering in the UI |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- Index on `organization_id`
- Unique Index on `(organization_id, name)`
- Unique Index on `(organization_id, slug)`

**RLS:** Readable publicly. Writable by org members.

---

### `services`

A bookable service offered by an organization.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `organization_id` | `uuid` | NOT NULL, FK → `organizations(id)` ON DELETE CASCADE | |
| `category_id` | `uuid` | NULLABLE, FK → `service_categories(id)` ON DELETE SET NULL | Optional grouping |
| `name` | `text` | NOT NULL | e.g. "Haircut", "Consultation" |
| `slug` | `text` | NOT NULL | Unique per org, URL-friendly identifier |
| `description` | `text` | | Optional description |
| `duration` | `integer` | NOT NULL | Duration in minutes |
| `price` | `integer` | NOT NULL, DEFAULT `0` | Price in smallest currency unit (e.g. cents). Currency dictated by org. |
| `color` | `text` | | Predefined palette hex code for UI |
| `display_order` | `integer` | NOT NULL, DEFAULT `0` | Controls ordering in the UI |
| `is_active` | `boolean` | NOT NULL, DEFAULT `true` | Inactive services cannot be booked |
| `buffer_before_minutes` | `integer` | NOT NULL, DEFAULT `0` | Buffer time before appointment |
| `buffer_after_minutes` | `integer` | NOT NULL, DEFAULT `0` | Buffer time after appointment |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- Index on `(organization_id, is_active)`
- Index on `(category_id)`
- Unique Index on `(organization_id, name)`
- Unique Index on `(organization_id, slug)`

**RLS:** Readable by anyone with the organization's public booking link. Writable by org members.

---

### `resources`

Anything that can be reserved — a person, room, or asset.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `organization_id` | `uuid` | NOT NULL, FK → `organizations(id)` ON DELETE CASCADE | |
| `name` | `text` | NOT NULL | e.g. "Barber 1", "Room A", "Court 2" |
| `slug` | `text` | NOT NULL | Unique per org, URL-friendly identifier |
| `type` | `text` | | Informational only. Not used in business logic. |
| `color` | `text` | | Predefined palette color |
| `avatar_url` | `text` | | Profile image for staff |
| `display_order` | `integer` | NOT NULL, DEFAULT `0` | Controls ordering in the UI |
| `is_active` | `boolean` | NOT NULL, DEFAULT `true` | Inactive resources are hidden from availability |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- Index on `(organization_id, is_active)`
- Unique Index on `(organization_id, slug)`

**RLS:** Readable by anyone with the org's booking link. Writable by org members.

---

### `business_hours`

The weekly operating schedule for an organization.

One row per day of the week per organization.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `organization_id` | `uuid` | NOT NULL, FK → `organizations(id)` ON DELETE CASCADE | |
| `day_of_week` | `integer` | NOT NULL | 0 = Sunday, 1 = Monday, … 6 = Saturday |
| `is_closed` | `boolean` | NOT NULL, DEFAULT `false` | If true, business is closed this day |
| `open_time` | `time` | | Required if `is_closed = false` |
| `close_time` | `time` | | Required if `is_closed = false`. Must be > `open_time` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- `UNIQUE (organization_id, day_of_week)`

**Constraints:**
- `CHECK (is_closed = true OR (open_time IS NOT NULL AND close_time IS NOT NULL))`
- `CHECK (is_closed = true OR close_time > open_time)`

**RLS:** Readable publicly. Writable by org members.

---

### `business_closures`

Specific dates on which the organization is closed.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `organization_id` | `uuid` | NOT NULL, FK → `organizations(id)` ON DELETE CASCADE | |
| `date` | `date` | NOT NULL | The closed date |
| `reason` | `text` | | e.g. "Public Holiday", "Emergency Closure" |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- `UNIQUE (organization_id, date)`
- Index on `(organization_id, date)`

**RLS:** Readable publicly. Writable by org members.

---

### `resource_schedules`

A custom weekly availability schedule for a specific resource.

If a resource has no schedule for a given day, it inherits the organization's `business_hours` for that day.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `resource_id` | `uuid` | NOT NULL, FK → `resources(id)` ON DELETE CASCADE | |
| `organization_id` | `uuid` | NOT NULL, FK → `organizations(id)` ON DELETE CASCADE | Denormalized for RLS |
| `day_of_week` | `integer` | NOT NULL | 0 = Sunday … 6 = Saturday |
| `is_unavailable` | `boolean` | NOT NULL, DEFAULT `false` | If true, resource is unavailable this day |
| `open_time` | `time` | | Required if `is_unavailable = false` |
| `close_time` | `time` | | Required if `is_unavailable = false`. Must be > `open_time` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- `UNIQUE (resource_id, day_of_week)`

**Constraints:**
- `CHECK (is_unavailable = true OR (open_time IS NOT NULL AND close_time IS NOT NULL))`
- `CHECK (is_unavailable = true OR close_time > open_time)`

**RLS:** Readable publicly. Writable by org members.

---

### `bookings`

A reservation between a customer and an organization, for one or more services, optionally assigned to a resource.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `reference` | `text` | NOT NULL, UNIQUE per org | Human-friendly booking reference. Format: `BK-YYYYMMDD-NNNNNN`. Example: `BK-20260720-000042`. Generated by the application at booking creation. |
| `organization_id` | `uuid` | NOT NULL, FK → `organizations(id)` ON DELETE CASCADE | |
| `customer_id` | `uuid` | NOT NULL, FK → `customers(id)` | |
| `resource_id` | `uuid` | NULLABLE, FK → `resources(id)` ON DELETE SET NULL | Assigned by owner/staff or auto-assigned |
| `date` | `date` | NOT NULL | Date of the booking |
| `start_time` | `time` | NOT NULL | Start time of the booking |
| `end_time` | `time` | NOT NULL | Computed from start_time + total service duration |
| `source` | `booking_source` | NOT NULL | `ONLINE`, `WALK_IN`, `PHONE`, `STAFF` |
| `status` | `booking_status` | NOT NULL, DEFAULT `'CONFIRMED'` | Current status |
| `cancellation_reason` | `text` | NULLABLE | Set when status = `CANCELLED` |
| `notes` | `text` | NULLABLE | Internal notes by owner/staff |
| `checked_in_at` | `timestamptz` | NULLABLE | Set when status transitions to `CHECKED_IN` |
| `completed_at` | `timestamptz` | NULLABLE | Set when status transitions to `COMPLETED` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- Index on `(organization_id, date, status)`
- Index on `(resource_id, date, status)` — used for conflict detection
- Index on `customer_id`
- `UNIQUE (organization_id, reference)` — reference is unique within an org

**Database Constraints:**
- `CHECK (end_time > start_time)`
- `UNIQUE (organization_id, reference)`

**Application Rules** (enforced by the backend, not PostgreSQL):
- A resource cannot have two bookings where `date` is equal and time ranges overlap, with `status IN ('CONFIRMED', 'CHECKED_IN')`. Checked atomically at booking creation and resource re-assignment.
- Status transitions must follow the allowed lifecycle (see ARCHITECTURE.md). Invalid transitions return `INVALID_STATUS_TRANSITION`.
- `min_advance_minutes` is checked against the current time at booking creation (public bookings only).
- `cancellation_cutoff_hours` is checked at customer-initiated cancellation only. Owner/staff bypass this rule.

**RLS:**
- Org members can read/write all bookings in their organization.
- Customers with an account can read their own bookings (where `customer.user_id = auth.uid()`).

---

### `booking_services`

A snapshot of the service(s) included in a booking.

Stores service details at the time of booking to preserve history when service prices or names change.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `booking_id` | `uuid` | NOT NULL, FK → `bookings(id)` ON DELETE CASCADE | |
| `service_id` | `uuid` | NULLABLE, FK → `services(id)` ON DELETE SET NULL | Nullable in case service is deleted later |
| `service_name` | `text` | NOT NULL | Snapshot of name at time of booking |
| `duration` | `integer` | NOT NULL | Snapshot of duration (minutes) at time of booking |
| `price` | `integer` | NOT NULL | Snapshot of price at time of booking |
| `quantity` | `integer` | NOT NULL, DEFAULT `1` | |
| `total` | `integer` | NOT NULL | `price × quantity` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Indexes:**
- Index on `booking_id`

**RLS:** Same as `bookings`.

---

## Entity Relationship Summary

```
organizations
  ├── organization_members  (user → org, with role)
  ├── customers             (scoped to org)
  ├── services              (scoped to org)
  ├── resources             (scoped to org)
  │     └── resource_schedules
  ├── business_hours        (7 rows per org)
  ├── business_closures     (ad hoc closed dates)
  └── bookings
        ├── booking_services  (1..n per booking)
        ├── → customers
        └── → resources
```

---

## Migration Philosophy

This project follows a documentation-first workflow for all database changes:

1. **Update this file first.** Document the change in `DATABASE.md` before touching any code.
2. **Update the Drizzle schema.** Edit the table definition in `packages/db/src/schema/`.
3. **Generate a migration.** Run `pnpm db:generate` to produce a SQL migration file.
4. **Review the migration.** Inspect the generated SQL before applying it.
5. **Apply the migration.** Run `pnpm db:migrate` against the target environment.
6. **Never edit the production database manually.** All changes go through migrations.

If documentation and schema conflict, documentation wins. Update the docs first, then reconcile the schema.

---

## Future Schema

The following entities are intentionally **excluded from the MVP**. Their absence is a deliberate product decision, not an oversight. Future contributors should add them only when the corresponding product feature is planned.

| Entity | Needed for | Planned version |
|---|---|---|
| `payments` | Payment collection, deposits, refunds | V3 |
| `notifications` | Reminder system, cancellation alerts | V3 |
| `notification_logs` | Delivery tracking for messages | V3 |
| `reviews` | Customer ratings and feedback | V4+ |
| `loyalty_points` | Customer reward programs | V4+ |
| `category_icons` | Visual icons for categories | V2+ |
| `category_hierarchy` | Nested parent/child categories | V3+ |
| `staff_skills` | Mapping resources to specific services they can perform | V2+ |
| `resource_service_map` | Which resources can perform which services | V2+ |
| `takeaway_orders` | Self-ordering / click-and-collect flow | V2 |
| `webhook_endpoints` | Third-party integration event delivery | V3+ |
| `idempotency_keys` | Safe retry of booking creation requests | V2+ |