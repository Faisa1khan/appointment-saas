# Product Requirements Document

## Product

**Booking Platform for Service Businesses**

A multi-tenant SaaS platform that enables service businesses to manage appointments, walk-ins, resources, and customers from a single dashboard. Customers can book online or walk in.

---

## Problem Statement

Most small and medium service businesses still rely on phone calls, WhatsApp messages, physical notebooks, or spreadsheets to manage bookings. Existing booking software is either:

- Too expensive for small businesses
- Built only for one specific industry
- Too complicated to set up
- Missing mobile-first design

**Our goal:** Build one flexible booking platform that works across multiple service industries with minimal setup time.

---

## Target Customers

### Primary (MVP)

| Business Type | Resources | Services |
|---|---|---|
| Salons & Barbers | Barbers, chairs | Haircut, Beard Trim, Color |
| Clinics | Doctors, rooms | Consultation, Check-up |
| Spas & Wellness | Staff, rooms | Massage, Facial |
| Gyms & Fitness Studios | Trainers, courts | Session, Class |
| Coworking Spaces | Rooms, desks | Hourly, Daily booking |
| Sports Venues | Courts, lanes | Court booking |

### Secondary (Future)

- Restaurants & Cafés (table reservations)
- Home Service Businesses (technicians visiting customers)
- Delivery Services

---

## User Personas

### Persona 1: Business Owner (Amir)

- Runs a small barber shop with 3 barbers
- Manages bookings manually via phone and WhatsApp
- Wants to reduce no-shows and missed calls
- Not technical — needs simple setup
- Checks bookings from phone throughout the day

**Needs:**
- See today's bookings at a glance
- Add walk-in customers quickly
- Check in and complete bookings fast
- Know which barber is free

---

### Persona 2: Customer (Fatima)

- Books a haircut every 3 weeks
- Prefers to book online instead of calling
- Wants to see available times and choose a slot
- May cancel or reschedule if plans change

**Needs:**
- Fast, simple booking in under 1 minute
- Confirmation she can refer back to
- Easy cancellation or rescheduling

---

### Persona 3: Staff Member (Hassan)

- Works as a receptionist at a clinic
- Manages walk-in patients and scheduled appointments
- Checks in arriving patients
- Marks consultations as complete

**Needs:**
- View today's appointments
- Check in arriving patients
- Update booking status quickly

---

## Core Modules (MVP)

### 1. Authentication

Owners register with email and password via Supabase Auth.

Customers can book as guests (phone or email only) or with an account.

Staff are invited by the owner.

---

### 2. Organization Setup

After registration, an owner creates their organization with:

- Business name
- Contact details
- Timezone
- Booking interval (e.g. every 15 or 30 minutes)
- Minimum advance booking time (how many minutes ahead a customer must book)
- Cancellation cutoff window (how many hours before the booking a customer can no longer self-cancel)
- Business hours (weekly schedule)

---

### 3. Resources

Owners add resources (staff members, rooms, equipment, etc.).

Each resource can have a custom availability schedule that overrides business hours.

---

### 4. Services

Owners add bookable services with name, duration, and price.

Services are linked to bookings at the time of booking (snapshot stored to preserve price history).

---

### 5. Customers

Customers are created as part of the booking flow.

Guest customers (no account) are stored with phone/email.

If they later create an account with the same verified contact, historical bookings are linked.

---

### 6. Bookings

Core feature. A booking links a customer, one or more services, an optional resource, a date, and a time slot.

#### Booking Sources

| Source | Description |
|---|---|
| `ONLINE` | Customer booked via the booking page |
| `WALK_IN` | Customer walked in — owner/staff created the booking |
| `PHONE` | Owner/staff created the booking from a phone call |
| `STAFF` | Owner/staff created the booking directly |

#### Booking Statuses

| Status | Description |
|---|---|
| `CONFIRMED` | Booking is scheduled and upcoming |
| `CHECKED_IN` | Customer has arrived |
| `COMPLETED` | Service is done |
| `CANCELLED` | Booking was cancelled |
| `NO_SHOW` | Customer did not arrive |

---

### 7. Availability

The backend computes available time slots using:

- Organization booking interval
- Service duration
- Business hours
- Resource schedule
- Existing bookings

The frontend always fetches slots from the backend. It never calculates them locally.

---

### 8. Walk-ins

Walk-ins are bookings with `source = WALK_IN`.

Owners or staff create a walk-in booking for customers who arrive without a prior appointment.

Walk-in bookings follow the same lifecycle as regular bookings.

---

### 9. Dashboard

The owner's primary view for daily operations.

Shows:
- Today's upcoming bookings
- Walk-in bookings
- Resource availability at a glance
- Quick actions (check in, complete, cancel, no-show)

---

## User Stories

### Authentication

- As an **owner**, I want to register with my email and password so I can access the platform.
- As an **owner**, I want to set up my organization right after registration so I can start accepting bookings.
- As a **customer**, I want to book an appointment without creating an account so I don't have to sign up.
- As a **customer**, I want to create an account and see my past bookings linked to my phone or email.

### Services

- As an **owner**, I want to add services with name, duration, and price so customers can book them.
- As an **owner**, I want to deactivate a service without deleting it so it no longer appears as bookable.

### Resources

- As an **owner**, I want to add resources (staff, rooms, equipment) so they can be assigned to bookings.
- As an **owner**, I want to set custom availability hours for each resource so the system respects their individual schedule.

### Bookings

- As a **customer**, I want to select services, choose a date, and see available time slots so I can book quickly.
- As a **customer**, I want to reschedule my booking if my plans change.
- As a **customer**, I want to cancel my booking if I no longer need it.
- As an **owner**, I want to create a booking on behalf of a customer over the phone.
- As an **owner**, I want to check in a customer when they arrive.
- As an **owner**, I want to mark a booking as complete when the service is done.
- As an **owner**, I want to mark a booking as no-show if the customer didn't arrive.
- As an **owner**, I want to cancel a booking with a reason.

### Walk-ins

- As an **owner**, I want to create a walk-in booking for a customer who just arrived so they are in the system.
- As a **staff member**, I want to see today's walk-in bookings so I can manage the queue manually.

### Dashboard

- As an **owner**, I want to see today's bookings sorted by time so I can plan the day.
- As an **owner**, I want to see which resources are free right now so I can assign new walk-ins.
- As an **owner**, I want to navigate to any date on the dashboard so I can view past and future bookings.
- As an **owner**, I want to see my public booking page URL on the dashboard so I can easily share it with customers.

### Booking Policy

- As an **owner**, I want to set a minimum advance booking time so customers can’t book at the last minute.
- As an **owner**, I want to set a cancellation cutoff window so customers can’t cancel at the last minute.

### Guest Booking Retrieval

- As a **guest customer**, I want to look up my booking by entering my phone number so I can find my booking details if I closed the confirmation page.

### Booking Confirmation Message

- As a **customer**, I want to receive a WhatsApp message when I book so I have instant confirmation on my phone.
- As a **customer without a phone number**, I want to receive a confirmation email as a fallback.

---

## Acceptance Criteria (MVP)

| Feature | Criteria |
|---|---|
| Registration | Owner can register, create an org, and land on dashboard in < 3 steps |
| Booking Creation | Customer can select a service, pick a date and slot, and confirm a booking |
| Availability | Available slots are computed by the backend; no slot in the past is shown |
| Min Advance Time | Slots within `min_advance_minutes` from now are excluded from availability |
| Conflict Prevention | Two bookings for the same resource at the same time are impossible |
| Check In | Owner/staff can check in a confirmed booking in one tap |
| Completion | Owner/staff can mark a checked-in booking as complete |
| Cancellation | Customer and owner can cancel a confirmed booking |
| Cancellation Cutoff | Customer cannot self-cancel within `cancellation_cutoff_hours` of booking start |
| Walk-in | Owner can create a walk-in booking in under 30 seconds |
| Guest Booking | Customer can book without registering |
| Guest Lookup | Guest can retrieve active bookings by entering their phone number |
| Account Linking | Guest customer who registers with the same phone/email sees past bookings |
| Confirmation Message | Customer receives a WhatsApp confirmation if phone provided; email if no phone but email provided |
| Booking Page URL | Owner sees their public booking link prominently on the dashboard |

---

## Out of Scope (MVP)

- Payments and deposits
- Full notification system (reminders, cancellation alerts, no-show follow-ups) — deferred to V3
- QR code check-in
- Calendar sync (Google, Apple)
- Staff permissions beyond status updates
- Reviews and ratings
- Loyalty and rewards
- Analytics and reports
- Automated assignment strategies (round-robin, load balancing)
- Recurring bookings
- Waitlists
- Takeaway / Self-ordering (planned for V2)
- Home Delivery

## Future Modules

### Near-Term (V2–V3)

- QR Check-in
- QR Table Ordering
- **Takeaway (Self-Ordering / Click-and-Collect)** — Customer browses the menu, places an order online, and picks it up in person at the business. No rider, no tracking, no delivery logistics. The business receives the order and prepares it. Customer collects it when ready.
- Payments
- Notifications
- Analytics

### Deferred (V4+)

- Home Service Booking — technician visits customer address
- Home Delivery — requires rider assignment, dispatch, and live tracking; intentionally out of scope until V4
- Loyalty
- AI Assistant

---

## Success Metrics (MVP)

| Metric | Target |
|---|---|
| Time to first booking (owner onboarding) | < 10 minutes |
| Customer booking completion rate | > 80% |
| Double-booking incidents | 0 |
| Mobile usability score | Fully responsive on all screen sizes |