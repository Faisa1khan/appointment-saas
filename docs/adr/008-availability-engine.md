# ADR 008: Availability Engine

## Context
The Availability Engine is the most critical architectural piece of the Arrivo platform. It must calculate valid booking slots dynamically based on numerous business rules, staff schedules, and existing bookings. Hardcoding availability logic in the frontend or duplicating it across endpoints would lead to severe bugs and double-bookings.

## Decision
We will build a centralized, backend-only Availability Engine that deterministically generates and validates time slots. The frontend will only ever query this engine and never compute availability locally.

## Design

### Input
- `organizationId`
- `serviceId` (determines duration, bufferBefore, bufferAfter)
- `staffId` (optional, determines specific schedules)
- Date range (`startDate`, `endDate`)

### Output
- A list of valid, unbooked time slots (e.g., `["09:00", "09:30", "10:00"]`) in the organization's local timezone.

### Slot Generation Algorithm
1. **Business Hours / Staff Schedules**: Fetch the weekly schedule for the requested date. If closed or staff is unavailable, return empty.
2. **Holidays / Closures**: Fetch specific date closures. If closed, return empty.
3. **Interval Rounding**: Generate potential slots between `openTime` and `closeTime` based on the organization's `bookingInterval` (e.g., every 15, 30, or 60 mins).
4. **Service Duration & Buffers**: Ensure each potential slot can fit `bufferBefore + duration + bufferAfter` before the `closeTime`.
5. **Conflict Detection**: Fetch existing CONFIRMED and CHECKED_IN bookings for the given date.
6. **Filtering**: Remove any potential slots that overlap with existing bookings (considering buffers of both the existing bookings and the requested service).
7. **Advance Notice**: Remove slots that start within the organization's `minAdvanceMinutes` from the current time.

### Timezone Handling
- All inputs from the user are assumed to be in the organization's configured timezone.
- All slot boundaries are computed in the organization's timezone using libraries like `date-fns-tz`.
- Dates are stored in UTC in the database, but query boundaries are strictly converted to UTC bounds based on the organization's timezone.

### Atomic Re-Validation
- When a booking is finalized, the engine must re-validate the chosen slot in a transaction to prevent race conditions (double bookings).

## Consequences
- The frontend is entirely "dumb" regarding time computation.
- Performance of this engine is critical; database queries must be heavily indexed on `date`, `status`, and `organizationId`.
