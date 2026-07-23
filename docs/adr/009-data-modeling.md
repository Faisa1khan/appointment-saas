# ADR 009: Data Modeling Conventions

## Context
As the platform expands, database schema definitions must follow a strict, consistent set of rules to prevent data anomalies, timezone bugs, precision loss (floating-point math), and accidental data loss.

## Decision
All future tables, models, and migrations must adhere to the following data modeling conventions:

### 1. Primary Keys
- Every table must use a UUID primary key, generated dynamically by the database (`uuid('id').defaultRandom().primaryKey()`). 
- Avoid auto-incrementing integers for security and distributed data scalability.

### 2. Standard Audit Fields
- Every table must include standard tracking timestamps with timezone awareness:
  - `createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`
  - `updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()`
- `updatedAt` must be bumped automatically by the application (or a DB trigger) on update.

### 3. Tenant Isolation
- Every tenant-scoped entity must have an `organizationId` foreign key referencing `organizations.id`.
- This column must be fully protected by Row-Level Security (RLS) policies.

### 4. Soft-Deletes & Archiving
- We never hard-delete records that have relational importance (e.g., a Service that has historical Bookings).
- Use `isActive: boolean().notNull().default(true)` (or an `archivedAt` timestamp) to softly remove items from the active application view.

### 5. Money (Currency)
- **Never use floating-point types (FLOAT/REAL) for money.**
- Money is always stored as an `integer` representing the **smallest currency unit** (minor units). For example, $25.00 is stored as `2500` (cents).
- A `currency` string column (e.g., `'USD'`, `'INR'`) should accompany prices when a system supports multiple currencies.

### 6. Time and Duration
- Durations are always stored as integers representing **minutes** (e.g., `durationMinutes: integer()`). Avoid complex DB intervals.
- Timestamps must always be stored in **UTC** with timezone awareness (`{ withTimezone: true }`). Application logic converts these to the organization's local timezone.

### 7. Color Constraints
- We restrict colors to a predefined frontend palette (e.g., `blue`, `green`, `red`) stored as strings, rather than allowing free-form hex values, ensuring UI consistency across themes.

## Consequences
- Developers must explicitly convert currency and time data before passing it to the database or displaying it in the UI.
- All new schemas will be rejected in code review if they violate these principles.
