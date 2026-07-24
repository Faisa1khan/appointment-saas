# ADR 011: Business Hours Data Model

## Context
Organizations need to configure their operational hours and closed days so the Availability Engine can accurately compute booking slots. We must design a data model that is simple enough for the MVP but robust enough for a timezone-aware scheduling platform.

## Decision

We will implement Business Hours as a pure configuration module with the following architectural decisions:

### 1. Data Model
- **`business_hours`:** A simple table with exactly 7 rows per organization (one for each weekday, 0-6 where 0 = Sunday).
  - Columns: `dayOfWeek`, `isClosed`, `openTime`, `closeTime`.
  - For the MVP, we do not support multiple shifts per day (e.g., 9:00-12:00 and 13:00-17:00).
- **`business_closures`:** Date-specific closures (holidays).
  - Columns: `date`, `reason`.
  - For the MVP, we do not support recurring yearly holidays, half-day closures, or custom holiday schedules.

### 2. Time Format Policy
- **Storage:** Times are stored in 24-hour format (`HH:mm:ss`) using Postgres `time` columns.
- **Locale vs Storage:** We never store locale-specific time strings (like "1:00 PM"). If the UI supports 12-hour display via locale formatting, the underlying data strictly remains in 24-hour format.
- **Time Inputs:** We use native HTML `<input type="time">` which handles locale-display for the user while natively yielding `HH:mm` format strings to our system.

### 3. Timezone Behavior
- Business hours inherit strictly from the organization's timezone (`organizations.timezone`).
- We do not allow per-day or per-staff timezone overrides for the MVP. The entire organization operates in a single configured timezone.

### 4. Overnight Shifts
- We explicitly defer overnight shifts (where `closeTime < openTime`) for the MVP.
- Zod validation will strictly enforce `closeTime > openTime`. Allowing overnight shifts requires complex logic in the Availability Engine (spanning day boundaries) which is out of scope for V1.

### 5. Separation of Concerns
- The Business Hours module **only saves configuration**.
- It does **not** generate booking slots. Generation is exclusively the responsibility of the Availability Engine, which will read from these configuration tables at query time.

## Consequences
- The MVP remains simple and deterministic.
- UI validation is straightforward (open/close required when open, close > open).
- Adding multi-shift or overnight shift support in the future will require schema migrations (e.g., extracting shift ranges into a sub-table) and significant Availability Engine updates.
