# ADR 011: Multi-Tenant Security Model

## Status
Accepted

## Context
As a multi-tenant SaaS application, Arrivo must securely isolate data between different organizations while supporting role-based access control (RBAC) within each organization. Although our current implementation accesses the database via trusted server-side code (Next.js Server Actions connecting as the postgres superuser), we must build a robust authorization model at the database layer (Row Level Security - RLS).

This provides "defense in depth" and prepares the architecture for a future state where database connections enforce RLS based on Supabase JWTs, or when external integrations directly query the database.

## Principles

1. **Authentication** determines *who* the user is (`auth.users`, `app_users`).
2. **Organization membership** determines *what data* they can see (read access).
3. **Role** determines *what actions* they can perform (write access).
4. **RLS is defense in depth**, even though current application queries run through trusted server-side code.
5. **All future tables must enable RLS before being considered complete.**

## Decision

We will implement Row Level Security (RLS) on all database tables following this matrix:

### Authentication & Identity
| Table | SELECT | INSERT | UPDATE | DELETE |
| --- | --- | --- | --- | --- |
| `app_users` | Own row | Server only | Own profile | Never |

### Organizations
| Table | SELECT | INSERT | UPDATE | DELETE |
| --- | --- | --- | --- | --- |
| `organizations` | Members | Owner onboarding | Owner/Admin | Never |

### Domain Tables
| Table | Read | Write |
| --- | --- | --- |
| `services` | Member | Owner/Admin |
| `service_categories` | Member | Owner/Admin |
| `business_hours` | Member | Owner/Admin |
| `business_closures`| Member | Owner/Admin |
| `resources` | Member | Owner/Admin |
| `resource_schedules`| Member | Owner/Admin |
| `customers` | Member | Owner/Admin |
| `bookings` | Member | Owner/Admin (with later exceptions for booking creation) |
| `booking_services` | Member | Owner/Admin |

To implement this cleanly, we introduce helper SQL functions:
- `public.is_org_member(org_id)`: Checks if the current user belongs to the organization. Used for `SELECT` policies.
- `public.is_org_owner(org_id)`: Checks if the current user belongs to the organization with the `OWNER` role. Used for `INSERT`, `UPDATE`, and `DELETE` policies.

*Note: As new roles (e.g., Staff, Admin) are introduced, we will evolve `is_org_owner` to `is_org_admin_or_owner` or similar, without having to rewrite every table's individual RLS policies.*

## Consequences
- Every new database table requires an RLS policy migration to be considered complete.
- We establish a strong security posture that relies on the database layer to prevent cross-tenant data leakage or unauthorized writes, regardless of frontend or backend vulnerabilities.
- Future architectural shifts (e.g., Supabase JWT enforced queries) will have a much smoother migration path.
