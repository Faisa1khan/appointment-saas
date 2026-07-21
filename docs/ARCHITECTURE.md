# Booking Platform Architecture

## Vision

Build a generic, multi-tenant booking platform that can be used by salons, clinics, restaurants, gyms, sports centers, coworking spaces, and any business that accepts appointments or reservations.

## Design Principles

1. Keep it simple.
2. API-first development.
3. Mobile-first design.
4. Multi-tenant architecture.
5. Customer-first experience — prefer fewer clicks for customers.
6. Business rules handled by the backend.
7. Extensible without redesigning the database.
8. Prefer configuration over complexity.
9. Design generic solutions instead of industry-specific ones.
10. Add complexity only when a real business needs it.

## MVP Scope

- Authentication
- Organizations
- Customers
- Services
- Resources
- Bookings
- Walk-ins
- Queue Management
- Business Hours
- Availability
- Dashboard

### Out of Scope (MVP)

- Payments
- Invoices
- Staff permissions (beyond basic status updates)
- Marketing
- Reviews
- Loyalty
- Analytics
- Notifications
- QR Check-In
- Calendar Sync

## User Roles

### Owner

The person who registers the organization.

Full access to all features:

- Create and manage the organization
- Add and manage resources
- Add and manage services
- Configure business hours
- View and manage all bookings
- Check in customers
- Mark bookings as complete or no-show
- Reschedule or cancel bookings

### Customer

A person who makes bookings.

- Book one or more services
- View their own bookings
- Reschedule their own bookings
- Cancel their own bookings

Customers can book as a guest (phone or email) or create an account.

### Staff

A user who can perform operational tasks assigned by the owner.

- Check in customers
- Mark bookings as complete or no-show
- View bookings assigned to their resource

> TODO: Define the full scope of staff permissions. For MVP, staff can update booking status. Detailed permission model is deferred.

## Multi-Tenancy

Every entity in the system belongs to an organization.

All data is scoped by `organization_id`.

A customer can exist across multiple organizations (e.g., one person visits both a salon and a clinic).

> TODO: Define the Row Level Security (RLS) strategy. Options: Supabase RLS policies on every table, or application-level filtering via `organization_id` in every query.

## Authentication

Authentication is handled by Supabase Auth.

### Owner Authentication

Owners register with email and password.

After registration, the owner creates their organization.

### Customer Authentication

Customers have two options:

- **Guest booking**: Customer provides phone number or email. No account required.
- **Account booking**: Customer creates an account to manage their bookings.

> TODO: Define the guest-to-account conversion flow. Can a guest later create an account and see their past bookings?

## Core Concepts

### Organization

A business using the platform.

Examples:
- Salon
- Restaurant
- Clinic
- Gym

An organization has:

- Name
- Business hours
- Resources
- Services

### Customer

A person making bookings.

A customer has:

- Name
- Phone
- Email (optional)

Customers are scoped to an organization.

### Service

A bookable offering.

Examples:
- Haircut
- Beard Trim
- General Consultation
- Massage

A service has:

- Name
- Duration (in minutes)
- Price
- Active status

### Resource

Anything that can be reserved.

Examples:
- Barber
- Doctor
- Table
- Meeting Room
- Court

Resources are generic.
The booking engine does not care whether the resource is a person or an asset.

A resource has:

- Name
- Type (informational only, not used for logic)
- Active status
- Availability schedule

### Booking

Represents a reservation.

A booking contains:

- Organization
- Customer
- Resource
- One or more Services (via Booking Service)
- Date
- Start Time
- End Time
- Source
- Status

### Booking Service

Stores a snapshot of service details at the time of booking.

Snapshot includes:

- Service Name
- Duration
- Price
- Quantity
- Total

This prevents future service price changes from affecting past bookings.

## Booking Lifecycle

### Booking Flow

```
Customer
  ↓
Choose Service(s)
  ↓
Select Date
  ↓
Select Time
  ↓
Backend Availability Check
  ↓
Booking Created (status = CONFIRMED)
```

The frontend displays available slots.

The backend validates availability before creating the booking.

The frontend never calculates availability.

### Booking Sources

How the booking was created:

- `ONLINE` — Customer booked through the platform
- `WALK_IN` — Customer walked in without a prior booking
- `PHONE` — Owner/staff created the booking from a phone call
- `STAFF` — Owner/staff created the booking directly

### Booking Statuses

- `CONFIRMED` — Booking is confirmed and upcoming
- `CHECKED_IN` — Customer has arrived and checked in
- `COMPLETED` — Service is finished
- `CANCELLED` — Booking was cancelled
- `NO_SHOW` — Customer did not show up

### Status Transitions

```
CONFIRMED  →  CHECKED_IN  →  COMPLETED
CONFIRMED  →  CANCELLED
CONFIRMED  →  NO_SHOW
```

Only these transitions are allowed:

| From | To | Who |
|---|---|---|
| CONFIRMED | CHECKED_IN | Owner, Staff |
| CONFIRMED | CANCELLED | Owner, Staff, Customer |
| CONFIRMED | NO_SHOW | Owner, Staff |
| CHECKED_IN | COMPLETED | Owner, Staff |

A booking cannot go backwards in status.

A cancelled or completed booking cannot be modified.

### Rescheduling

Customers can reschedule bookings if another slot is available.

Owners can also reschedule bookings.

Rescheduling creates a new time slot on the same booking.

Only `CONFIRMED` bookings can be rescheduled.

### Cancellation

Customers can cancel their own bookings.

Owners can cancel bookings with a reason.

Only `CONFIRMED` bookings can be cancelled.

### No Show

Owners can mark `CONFIRMED` bookings as `NO_SHOW`.

### Check In

Manual action by owner or staff.

Transitions the booking from `CONFIRMED` to `CHECKED_IN`.

Automatically records the check-in timestamp.

### Completion

Manual action by owner or staff.

Transitions the booking from `CHECKED_IN` to `COMPLETED`.

Automatically records the completion timestamp.

## Walk-ins and Queue

Walk-ins are bookings with `source = WALK_IN`.

See: Decision 001 in DECISIONS.md.

### How Walk-ins Work

1. Customer walks into the business.
2. Owner or staff creates a booking with `source = WALK_IN`.
3. The booking enters the queue.
4. Owner assigns a resource (or the system assigns one).
5. When the resource is free, the customer is checked in.
6. Service is performed.
7. Booking is marked as complete.

### Queue

The queue is a logical view of walk-in bookings that are in `CONFIRMED` status, ordered by creation time (first come, first served).

The queue is scoped to an organization.

The queue shows:

- Customer name
- Requested service(s)
- Wait position
- Estimated wait time (based on current bookings)

> TODO: Define queue capacity rules. Is there a max queue size? What happens when the queue is full?

## Business Hours

Every organization defines its operating hours.

### Weekly Schedule

A default weekly schedule defines which days and hours the business is open.

Example:

- Monday: 09:00 – 18:00
- Tuesday: 09:00 – 18:00
- Sunday: Closed

### Holidays and Closures

The organization can mark specific dates as closed.

Examples:

- Public holidays
- Emergency closures
- Planned maintenance days

### Resource Schedules

Individual resources can have their own availability that differs from business hours.

Examples:

- A barber works Monday to Friday, 10:00 – 16:00
- A doctor is available only on Wednesday and Friday
- A meeting room is available 24/7

If a resource has no custom schedule, it inherits the organization's business hours.

## Availability Engine

Availability is always computed by the backend.

The frontend never calculates or infers availability.

### Inputs

The availability engine uses the following inputs to compute open slots:

1. **Business Hours** — When the organization is open
2. **Resource Schedules** — When the resource is available
3. **Existing Bookings** — Slots already taken
4. **Service Duration** — How long the requested service takes

### Slot Calculation

For a given date, resource, and service:

1. Start with the resource's available hours for that date (resource schedule or business hours fallback).
2. Subtract all existing bookings for that resource on that date.
3. Return remaining time blocks that are large enough to fit the requested service duration.

### Unavailability Reasons

When a slot is unavailable, the system should provide a reason whenever possible:

- Business Closed — The organization is not open
- Resource Unavailable — The resource has no schedule for this time
- Resource On Break — The resource is on a scheduled break
- Fully Booked — All slots for this resource are taken

### Conflict Prevention

The backend must prevent double-booking:

- A resource cannot have two overlapping bookings.
- Availability must be re-validated at the moment of booking creation.
- If a conflict is detected, the booking is rejected and the customer is shown updated availability.

> TODO: Define slot duration granularity. Are available slots shown in fixed increments (e.g., every 15 or 30 minutes) or are they purely derived from service duration?

## Resource Assignment

Customers do not choose a specific resource in the MVP.

The owner assigns a resource, or the system assigns one automatically.

Automatic assignment selects the first available resource that can perform the requested service.

Future versions may allow customers to choose a preferred resource.

> TODO: Define auto-assignment logic. Should it prefer the resource with the earliest available slot, the least bookings, or round-robin?

## Dashboard

The owner dashboard is the primary interface for managing daily operations.

> TODO: Define dashboard contents. Likely includes:
>
> - Today's bookings list
> - Current queue (walk-ins)
> - Upcoming bookings
> - Resource utilization
> - Quick actions (check in, complete, cancel, no-show)

## Future Enhancements

These features are out of scope for the MVP:

- Payments and Deposits
- QR Check-In
- Automatic Check-In
- Staff Skills and Specializations
- Resource-Service Mapping (which resources can perform which services)
- Notifications (SMS, Email, Push)
- Calendar Sync (Google Calendar, Apple Calendar)
- Reports and Analytics
- Customer Preferences (preferred resource, preferred time)
- Recurring Bookings
- Waitlist (notify customer when a cancelled slot opens up)