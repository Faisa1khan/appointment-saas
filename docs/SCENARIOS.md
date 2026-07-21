# Scenarios

> This document defines concrete business scenarios the system must handle correctly.
> Each scenario includes actors, steps, expected outcome, and edge cases.
> These are used to validate architecture, API, and database design decisions.

---

## Booking Scenarios

---

### SC-001: Customer Books Online Successfully

**Actors:** Customer (guest)

**Preconditions:**
- Organization is active and has business hours configured.
- At least one service and one resource are active.
- The requested date is not a closure.

**Steps:**
1. Customer selects a service.
2. Customer selects a date — system returns available slots.
3. Customer selects a slot and enters name + phone.
4. Customer submits the booking.

**Expected Outcome:**
- Booking created with `status = CONFIRMED`, `source = ONLINE`.
- Slot is no longer available for that resource on that date.

**Edge Cases:**
- Slot is taken by another user between selection and submission → `BOOKING_CONFLICT` returned → customer shown updated slots.

---

### SC-002: Customer Books Multiple Services

**Actors:** Customer (guest)

**Preconditions:**
- Organization has multiple active services (e.g. Haircut + Beard Trim).

**Steps:**
1. Customer selects two services (total duration = 60 min).
2. Customer selects a date and time slot.
3. System calculates `end_time = start_time + 60 min`.
4. Customer confirms.

**Expected Outcome:**
- Booking created with both services in `booking_services`.
- Slot size is 60 minutes.
- No other booking for that resource can start between the booking's `start_time` and `end_time`.

---

### SC-003: Customer Reschedules a Booking

**Actors:** Customer (authenticated)

**Preconditions:**
- Customer has a `CONFIRMED` booking.

**Steps:**
1. Customer opens booking and taps Reschedule.
2. Customer selects a new date and time.
3. System re-validates availability.
4. Customer confirms.

**Expected Outcome:**
- Booking `date`, `start_time`, and `end_time` are updated.
- Old slot is freed.
- New slot is reserved.

**Edge Cases:**
- New slot is not available → `BOOKING_CONFLICT` → customer shown available alternatives.
- Booking is not `CONFIRMED` → `INVALID_STATUS_TRANSITION` error.

---

### SC-004: Customer Cancels a Booking

**Actors:** Customer (authenticated or via link)

**Preconditions:**
- Customer has a `CONFIRMED` booking.

**Steps:**
1. Customer opens booking and taps Cancel.
2. Customer confirms.

**Expected Outcome:**
- Booking `status = CANCELLED`.
- Slot is freed for other customers.

**Edge Cases:**
- Booking is already `CHECKED_IN` or `COMPLETED` → cancellation denied → `INVALID_STATUS_TRANSITION`.

---

### SC-005: Customer is a No-Show

**Actors:** Owner or Staff

**Preconditions:**
- Booking is `CONFIRMED` and the scheduled time has passed.

**Steps:**
1. Owner/staff marks the booking as No Show.

**Expected Outcome:**
- Booking `status = NO_SHOW`.
- No-show is recorded in the customer's history.

---

### SC-006: Customer Arrives Late — Still Served

**Actors:** Customer, Owner/Staff

**Preconditions:**
- Booking is `CONFIRMED`.

**Steps:**
1. Customer arrives late.
2. Owner checks in the customer manually.

**Expected Outcome:**
- Booking transitions `CONFIRMED → CHECKED_IN`.
- `checked_in_at` is set to the actual arrival time.
- Service proceeds normally.
- Booking is later marked `COMPLETED`.

**Note:** The system does not automatically expire or cancel late bookings. Timeout logic is out of scope for MVP.

---

## Walk-in Scenarios

---

### SC-007: Walk-in Customer Successfully Served

**Actors:** Walk-in Customer, Owner/Staff

**Preconditions:**
- Business is open.
- At least one resource is available.

**Steps:**
1. Customer walks in.
2. Staff creates a walk-in booking: selects services, enters customer name + phone.
3. Staff assigns a resource (or leaves it for auto-assignment).
4. Booking created with `source = WALK_IN`, `status = CONFIRMED`.
5. When resource is free, staff checks in the customer.
6. Service performed.
7. Booking marked `COMPLETED`.

**Expected Outcome:**
- Full booking lifecycle completed.
- Customer record exists for future visits.

---

### SC-008: Walk-in with No Available Resource

**Actors:** Walk-in Customer, Owner

**Preconditions:**
- All resources have active `CONFIRMED` or `CHECKED_IN` bookings.

**Steps:**
1. Customer walks in.
2. Owner opens the dashboard and sees all resources are busy.
3. Owner tells the customer the wait time.
4. Owner creates a walk-in booking without a resource assigned.
5. When a resource becomes free, owner assigns it to the booking and checks in the customer.

**Expected Outcome:**
- Walk-in booking exists without a resource.
- Owner assigns resource when one becomes available.

---

## Business Operation Scenarios

---

### SC-009: Organization Closes for a Holiday

**Actors:** Owner

**Preconditions:**
- Organization is active.

**Steps:**
1. Owner adds a closure for a specific date (e.g. "National Holiday").
2. Customer tries to book on that date.
3. Backend returns no available slots.

**Expected Outcome:**
- `GET /availability` returns empty slots with reason `BUSINESS_CLOSED`.
- No booking can be created for that date.

**Edge Cases:**
- Existing bookings on that date are not automatically cancelled. Owner must manually handle them.

---

### SC-010: Double Booking Attempt

**Actors:** Two customers booking at the same time

**Preconditions:**
- Resource has one remaining slot.

**Steps:**
1. Customer A and Customer B both select the same resource, date, and time slot simultaneously.
2. Customer A submits first → booking created successfully.
3. Customer B submits one second later → backend detects conflict.

**Expected Outcome:**
- Customer A's booking is created.
- Customer B receives `BOOKING_CONFLICT` error.
- Customer B is shown updated availability.

**Note:** Backend re-validates availability atomically at the moment of booking creation to prevent race conditions.

---

### SC-011: Resource Has Custom Schedule (Different from Business Hours)

**Actors:** Customer booking online

**Preconditions:**
- Business is open Monday–Saturday 09:00–18:00.
- Resource "Dr. Hassan" has a custom schedule: only available Wednesday and Friday, 10:00–14:00.

**Steps:**
1. Customer selects a service assigned to Dr. Hassan.
2. Customer selects a Monday date.
3. System returns no available slots.
4. Customer selects a Wednesday date.
5. System returns slots between 10:00 and (14:00 − service duration).

**Expected Outcome:**
- Resource's custom schedule overrides business hours for slot generation.
- Slots only exist on resource-available days and within resource-available hours.

---

### SC-012: Staff Marks Booking as Complete

**Actors:** Staff

**Preconditions:**
- Booking is in `CHECKED_IN` status.

**Steps:**
1. Staff finds the booking in the dashboard.
2. Staff taps Complete.

**Expected Outcome:**
- Booking status transitions to `COMPLETED`.
- `completed_at` timestamp is set.
- Resource is considered free from the `completed_at` time onward.

---

## Customer Account Scenarios

---

### SC-013: Guest Customer Links Historical Bookings to New Account

**Actors:** Guest Customer

**Preconditions:**
- Customer has made one or more guest bookings using phone `+92 301 9876543`.
- Customer does not have an account.

**Steps:**
1. Customer registers a new account.
2. Customer verifies their phone number via OTP.
3. Backend searches for existing `customer` records with matching verified phone and `user_id IS NULL`.
4. If found → `user_id` is set to the new account's user ID.

**Expected Outcome:**
- Customer logs in and sees all historical guest bookings.
- Future bookings are automatically linked to the account.

**Edge Cases:**
- If phone is already linked to another account → no linking occurs (phone is already claimed).

---

## Future Scenarios (Out of MVP Scope)

---

### SC-F01: Technician Delayed (Home Service)

A home service technician is delayed. Customer is notified via SMS. ETA is updated in real time.

### SC-F02: Restaurant Table Occupied

A customer with a reservation arrives, but the table is still occupied by the previous party. Staff marks the table as occupied and reschedules or holds the reservation.

### SC-F03: Delivery Rider Unavailable

An order is placed but no rider is available. System holds the order until a rider is assigned.

---

## Additional MVP Scenarios

---

### SC-014: Guest Customer Looks Up Their Booking

**Actors:** Guest Customer

**Preconditions:**
- Customer made a booking as a guest with phone `+92 301 9876543`.
- Customer closed the confirmation page and needs to find their booking.

**Steps:**
1. Customer visits the booking page and taps **Find My Booking**.
2. Customer enters their phone number.
3. System finds the customer record and their active bookings.
4. Customer sees their upcoming booking details.

**Expected Outcome:**
- Customer retrieves their booking without an account.
- Only `CONFIRMED` and `CHECKED_IN` bookings are shown.

**Edge Cases:**
- No match found → empty result returned (not a 404). Friendly message shown.
- Endpoint is rate-limited: too many requests → `429 Too Many Requests`.

---

### SC-015: Booking Rejected — Too Close to Start Time

**Actors:** Customer (online)

**Preconditions:**
- Organization has `min_advance_minutes = 60` (must book at least 1 hour ahead).
- Customer selects a slot starting in 30 minutes.

**Steps:**
1. Customer selects the slot and submits the booking.
2. Backend checks: `slot.start_time < now() + 60 minutes`.
3. Condition is true → reject with `ADVANCE_BOOKING_TOO_SOON`.

**Expected Outcome:**
- Booking is rejected.
- Customer sees a clear error message indicating the minimum booking window.
- Available slots are refreshed (the too-soon slot is now filtered out).

**Edge Cases:**
- Walk-in booking created by staff for the same time → allowed. Staff bypass `min_advance_minutes`.

---

### SC-016: Customer Cancellation Rejected Within Cutoff Window

**Actors:** Customer

**Preconditions:**
- Organization has `cancellation_cutoff_hours = 2`.
- Customer has a `CONFIRMED` booking starting in 1 hour.

**Steps:**
1. Customer opens their booking and taps Cancel.
2. Backend checks: `now() + 2 hours > booking.start_time` → true (1 hour < 2 hour cutoff).
3. Backend returns `CANCELLATION_WINDOW_CLOSED`.

**Expected Outcome:**
- Cancellation is blocked.
- Customer is shown a message to contact the business directly.
- Business contact details are displayed.

**Edge Cases:**
- Owner cancels the same booking → allowed. Owner is never subject to the cutoff window.

---

### SC-017: Booking Confirmation Email Sent

**Actors:** Customer (with email)

**Preconditions:**
- Customer provided their email address during booking.

**Steps:**
1. Customer completes booking.
2. Backend creates the booking successfully.
3. Backend triggers a fire-and-forget call to Resend API.
4. Email is sent to the customer's email address.

**Expected Outcome:**
- Customer receives an email containing: business name, date/time, services, resource (if assigned), and a link to look up their booking by phone.
- If Resend fails, the booking is still created. Email failure does not block booking creation.

**Edge Cases:**
- Customer provided no email → no email is sent. No error.
- Resend API is down → email is skipped silently. Booking is unaffected.