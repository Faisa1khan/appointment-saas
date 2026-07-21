# User Flows

> This document describes step-by-step user flows for all MVP scenarios.
> For business rules, see ARCHITECTURE.md. For API details, see API.md.

---

## Flow 1: Owner Onboarding

**Actor:** Owner (new user)

**Goal:** Register, set up their organization, and be ready to accept bookings.

**Steps:**

1. Owner visits the platform and clicks **Sign Up**.
2. Owner enters email and password → account is created via Supabase Auth.
3. Owner is redirected to the **Organization Setup** page.
4. Owner fills in:
   - Business name
   - Slug (auto-suggested from name)
   - Phone or email
   - Timezone
   - Booking interval (15 / 30 / 60 minutes)
5. Owner saves → organization is created; owner is assigned the `OWNER` role.
6. Owner is redirected to the **Dashboard** (empty state).
7. Dashboard prompts owner to:
   - Set business hours
   - Add services
   - Add resources
8. Owner configures business hours (one row per day of week).
9. Owner adds one or more services (name, duration, price).
10. Owner adds one or more resources (barber, room, court, etc.).
11. Owner optionally sets custom schedules for individual resources.
12. Setup complete → booking page is now live at `/{slug}`.

**Outcome:** Organization is fully configured. Customers can now book online.

---

## Flow 2: Customer Online Booking

**Actor:** Customer (no account required)

**Goal:** Book one or more services at a specific date and time.

**Steps:**

1. Customer visits the public booking page at `/{organization-slug}`.
2. Customer sees the business name, active services, and a booking form.
3. Customer selects one or more services.
4. Customer selects a date from the date picker.
5. Frontend calls `GET /availability?date=&service_ids=` → backend returns available slots.
6. Customer selects a time slot.
7. Customer enters their name, phone (and optional email).
8. Customer taps **Confirm Booking**.
9. Backend validates:
   - Services are active
   - Slot is still available (conflict check)
   - Business is open on that date
10. Booking is created with `status = CONFIRMED`, `source = ONLINE`.
11. Booking confirmation page is shown with:
    - Booking reference (ID)
    - Date and time
    - Services booked
    - Business contact details

**Outcome:** Booking is confirmed. Customer has a reference.

**Edge Cases:**
- If slot is taken between selection and confirmation → backend returns `BOOKING_CONFLICT` → frontend shows updated availability.
- If business is closed on the selected date → `BUSINESS_CLOSED` error → frontend prompts to choose another date.

---

## Flow 3: Walk-in Booking

**Actor:** Owner or Staff

**Goal:** Create a booking for a customer who just walked in.

**Steps:**

1. Owner/staff opens the **Dashboard**.
2. Taps **+ Walk-in**.
3. Enters customer name and phone (or selects existing customer by phone).
4. Selects one or more services.
5. Optionally assigns a resource (or leaves unassigned).
6. Taps **Create Walk-in**.
7. Booking is created with `source = WALK_IN`, `status = CONFIRMED`, date = today, time = now (rounded to next interval).
8. Walk-in appears in today's booking list.

**Outcome:** Walk-in is in the system. Owner/staff can check them in and complete the booking.

**Edge Cases:**
- If no resource is free → resource field remains empty; owner can assign later.
- If the customer already exists by phone → the existing customer record is used.

---

## Flow 4: Owner Creates a Booking (Phone / Staff)

**Actor:** Owner or Staff

**Goal:** Create a booking on behalf of a customer who called in.

**Steps:**

1. Owner/staff opens **Dashboard** → taps **+ New Booking**.
2. Enters or searches for customer (by name or phone).
3. If new customer → enters name and phone.
4. Selects one or more services.
5. Selects a date.
6. Frontend fetches available slots for the selected date and services.
7. Selects a time slot.
8. Optionally assigns a resource.
9. Selects source: **PHONE** or **STAFF**.
10. Taps **Confirm**.
11. Booking is created with the selected source and `status = CONFIRMED`.

**Outcome:** Booking created. Appears in today's or upcoming bookings list.

---

## Flow 5: Customer Check-In

**Actor:** Owner or Staff

**Goal:** Record that a customer has arrived for their appointment.

**Steps:**

1. Owner/staff opens the **Dashboard** → sees today's upcoming bookings.
2. Finds the booking (by customer name or time).
3. Taps **Check In** on the booking card.
4. Backend transitions status: `CONFIRMED → CHECKED_IN`. Sets `checked_in_at = now()`.
5. Booking card updates to show **Checked In** status.

**Outcome:** Booking is marked as checked in. Owner knows the customer is on-site.

**Errors:**
- Only `CONFIRMED` bookings can be checked in → `INVALID_STATUS_TRANSITION` if attempted on other statuses.

---

## Flow 6: Booking Completion

**Actor:** Owner or Staff

**Goal:** Mark a service as done after it's been performed.

**Steps:**

1. Owner/staff finds the `CHECKED_IN` booking in the dashboard.
2. Taps **Complete**.
3. Backend transitions status: `CHECKED_IN → COMPLETED`. Sets `completed_at = now()`.
4. Booking moves to the completed section of the dashboard.

**Outcome:** Booking is closed. Resource is now free for the next customer.

---

## Flow 7: Customer Cancellation

**Actor:** Customer (authenticated or via booking reference link)

**Goal:** Cancel an upcoming booking.

**Steps:**

1. Customer opens their booking (via confirmation link or account).
2. Taps **Cancel Booking**.
3. Customer confirms cancellation.
4. Backend transitions status: `CONFIRMED → CANCELLED`.
5. Cancellation confirmation is shown.

**Outcome:** Booking is cancelled. The slot becomes available for other customers.

**Errors:**
- Only `CONFIRMED` bookings can be cancelled.
- `CHECKED_IN`, `COMPLETED`, `CANCELLED`, and `NO_SHOW` bookings cannot be cancelled.

---

## Flow 8: Owner Cancels a Booking

**Actor:** Owner or Staff

**Goal:** Cancel a booking with a reason.

**Steps:**

1. Owner/staff finds the booking in the dashboard.
2. Taps **Cancel**.
3. Enters a cancellation reason (required for owner/staff).
4. Confirms.
5. Backend transitions status: `CONFIRMED → CANCELLED`. Reason is saved.

**Outcome:** Booking is cancelled. Reason is stored on the record.

---

## Flow 9: Reschedule a Booking

**Actor:** Customer or Owner/Staff

**Goal:** Move a booking to a different date or time.

**Steps:**

1. Customer (or owner/staff) opens the booking.
2. Taps **Reschedule**.
3. Selects a new date.
4. Frontend fetches available slots for the new date.
5. Selects a new time slot.
6. Confirms.
7. Backend:
   - Re-validates availability for the new date/time.
   - Updates `date`, `start_time`, and `end_time` on the booking.
8. Booking is updated with the new date and time.

**Outcome:** Booking is moved. Old slot is freed. New slot is reserved.

**Errors:**
- `BOOKING_CONFLICT` if the new slot is taken → show updated availability.
- Only `CONFIRMED` bookings can be rescheduled.

---

## Flow 10: No-Show

**Actor:** Owner or Staff

**Goal:** Record that a customer did not arrive.

**Steps:**

1. Owner/staff finds the `CONFIRMED` booking (past the scheduled time).
2. Taps **No Show**.
3. Backend transitions status: `CONFIRMED → NO_SHOW`.

**Outcome:** Booking is closed. No-show is recorded for the customer's history.

---

## Flow 11: Guest Customer Account Linking

**Actor:** Customer

**Goal:** Create an account and see historical guest bookings.

**Steps:**

1. Customer previously booked as a guest with phone `+92 301 9876543`.
2. Customer visits the platform and registers a new account.
3. During registration, they verify their phone number via OTP.
4. After verification, the backend searches for existing `customer` records in the same organization where `phone = +92 301 9876543` and `user_id IS NULL`.
5. If found → `user_id` is updated to the new account.
6. Customer logs in and sees their past guest bookings in their account.

**Outcome:** Historical bookings are linked. Customer has one unified view.

---

## Future Flows (Out of MVP Scope)

### QR Check-In
Customer scans QR code on arrival → automatic check-in without staff action.

### Home Service Booking
Customer books a technician to their address. Technician is dispatched and travels to location.

### Restaurant Table Ordering
After table check-in → customer scans QR → places food order → payment at end.

---

## Flow 12: Guest Looks Up Their Booking

**Actor:** Guest Customer (no account)

**Goal:** Find a booking after closing the confirmation page.

**Steps:**

1. Guest customer visits the public booking page at `/{slug}`.
2. Taps **Find My Booking**.
3. Enters their phone number.
4. System calls `GET /bookings/lookup?phone=` → returns all active bookings for that phone.
5. Customer sees a list of their upcoming bookings with date, time, and services.
6. Customer can tap a booking to see full details and the option to cancel or reschedule.

**Outcome:** Customer retrieves their booking without an account.

**Edge Cases:**
- No booking found for that phone → friendly message shown, no error.
- Endpoint is rate-limited to prevent abuse.

---

## Flow 13: Booking Rejected — Too Soon

**Actor:** Customer (online booking)

**Goal:** Book a slot that is within the business's minimum advance window.

**Steps:**

1. Customer selects a service and today's date.
2. Frontend displays available slots (slots within `min_advance_minutes` are already excluded by the backend).
3. Customer selects a slot that looked valid but by submission time it falls within the window.
4. Backend validates → booking start time is within `min_advance_minutes` of now.
5. Backend returns `ADVANCE_BOOKING_TOO_SOON`.
6. Frontend shows: *"Sorry, this business requires bookings to be made at least X minutes in advance. Please choose a later time."*
7. Frontend refreshes available slots.

**Outcome:** Booking is rejected cleanly. Customer is guided to choose a valid slot.

**Note:** Walk-in and staff-created bookings bypass this rule entirely.

---

## Flow 14: Customer Cancellation Rejected — Within Cutoff Window

**Actor:** Customer (authenticated or via lookup)

**Goal:** Cancel a booking that is too close to the start time.

**Steps:**

1. Customer opens their booking.
2. Taps **Cancel Booking**.
3. Backend checks: `now() + cancellation_cutoff_hours > booking.start_time`.
4. Condition is true → backend returns `CANCELLATION_WINDOW_CLOSED`.
5. Frontend shows: *"This booking can no longer be cancelled online. Please contact the business directly."*
6. Business contact details (phone, email) are shown.

**Outcome:** Cancellation is blocked. Customer is directed to contact the business.

**Note:** Owner and staff can always cancel, regardless of the cutoff window.