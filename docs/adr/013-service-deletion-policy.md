# ADR 013: Service Deletion Policy

## Status

Accepted

## Context

In an appointment booking system, services are the core bookable entities. Over time, an organization may stop offering a particular service. The traditional CRUD approach would suggest allowing the organization to "delete" the service.

However, services are tightly coupled to historical bookings. Deleting a service could lead to:
1. Broken foreign key constraints if not handled correctly.
2. Loss of historical context (e.g., reporting, auditing, customer history) if the related snapshot data isn't robust.
3. Accidental deletions that cause significant disruption to future schedules.

## Decision

We will **never expose a hard "Delete" action for services in the user interface**, especially for services that have ever been booked. 

Instead, we will use a **Soft Deactivation** strategy:
- Services will have an `is_active` boolean field.
- When an organization stops offering a service, they will mark it as `is_active = false` (Inactive).
- Inactive services will not appear as bookable options for new bookings.
- Inactive services will still exist in the database, ensuring that all historical references, audit logs, and reports remain perfectly intact.

In the future, we may introduce an "Archive" state for organizational purposes, or a hard "Delete" action strictly reserved for system administrators (or for newly created services that have never been booked), but for the standard application flow, services are deactivated, not deleted.

## Consequences

- **Positive:** Data integrity is guaranteed. Historical bookings will always resolve to a valid service record. Financial reporting remains accurate.
- **Positive:** Protects users from accidental, destructive actions.
- **Negative:** The `services` table will grow indefinitely as inactive services accumulate. However, given the scale of SaaS service records, this is highly unlikely to cause performance issues and is easily mitigated with indexes (e.g., `WHERE is_active = true`).
