# Database Design

## Multi Tenant

Every record belongs to one Organization.

Organizations cannot access each other's data.

---

## Tables

### organizations

- id
- name
- phone
- email
- timezone
- created_at

---

### users

- id
- organization_id
- name
- email
- role

---

### customers

- id
- organization_id
- name
- phone
- notes

---

### resources

Examples:

- Barber
- Doctor
- Therapist
- Table

Fields

- id
- organization_id
- name
- status

---

### services

- id
- organization_id
- name
- duration
- price

---

### bookings

- id
- organization_id
- customer_id
- service_id
- resource_id

Statuses

- Created
- Confirmed
- Checked In
- Completed
- Cancelled
- Rescheduled
- No Show

---

### queue

Statuses

- Waiting
- Called
- In Progress
- Completed
- Cancelled

---

### business_hours

- weekday
- opens_at
- closes_at

---

### holidays

- date
- reason