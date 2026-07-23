# Epics

> This document breaks down MVP features into epics and stories for sprint planning.
> The sequence prioritizes the Core Booking Domain over Business Administration.

---

## Epic 1: Platform Foundation ✅

**Goal:** Establish the technical foundation, authentication, onboarding, and platform compliance.

- Initialize Next.js project (TypeScript, Tailwind, shadcn/ui)
- Supabase Auth & Drizzle ORM setup
- Authentication & Onboarding (Owner registration, login, org creation)
- Platform Compliance (i18n, Theming, PWA, Mobile-first)
- ADRs & Feature Templates

---

## Epic 2: Core Booking Domain (Current)

**Goal:** Build the essential scheduling features required to accept and manage appointments.

### 2.1 Services
- Add, edit, archive, restore, and reorder services.
- Define service categories.

### 2.2 Business Hours
- Set weekly business hours (open/close time per day).
- Mark specific days or dates as closed (holidays).

### 2.3 Staff
- Add staff members.
- Set custom weekly schedules and day-level unavailability.

### 2.4 Availability & Booking Engine
- Generate appointment slots (using interval, duration, business hours, buffers, and staff schedules).
- Conflict detection.
- Backend re-validates availability at the moment of booking creation.
- Create, reschedule, cancel, and check-in bookings.
- Handle walk-in bookings.
- Owner/staff calendar views.

### 2.5 Customers
- Customers are created naturally through bookings (guest booking).
- View customer booking history.
- Create and manage customer records manually.

---

## Epic 3: Business Administration

**Goal:** Allow owners to manage their organization's settings and administrative tasks.

### 3.1 Organization Settings
- Edit business name, phone, email, address, logo, and timezone.
- Configure booking rules (interval, min advance time, cancellation window).

### 3.2 Team Management
- Invite staff members to the organization.
- Manage roles and permissions (Owner vs. Staff).

### 3.3 Notifications (Internal)
- In-app alerts for new bookings or cancellations.

---

## Epic 4: Customer Experience

**Goal:** Deliver a seamless booking experience for the end customer.

### 4.1 Public Booking Page
- Mobile-first public page (`/{slug}`) to view services and book appointments.

### 4.2 Customer Self-Service
- Rescheduling and cancellations by the customer.

### 4.3 Email & SMS Notifications
- WhatsApp/SMS confirmations and reminders.
- Email fallbacks.

---

## Epic 5: Growth Features (Future)

**Goal:** Post-MVP expansion for scaling the business.

- Payments & Invoices
- Reports & Analytics
- Coupons, Packages, Gift Cards, Memberships
- Recurring Appointments
- Waitlists
- Multi-location support
- Resource Scheduling (Rooms, Equipment)
- API & Webhooks
