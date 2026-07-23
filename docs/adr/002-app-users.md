# ADR 002: Application Users

## Context
Supabase Auth manages user identities within an isolated `auth.users` schema. However, our SaaS application requires storing domain-specific user information (display names, avatars, theme preferences, language preferences, and relationships to businesses).

## Decision
We separate application data from authentication data by creating a canonical `public.app_users` table in our database.

## Why this approach was chosen
Keeping business logic independent of the identity provider prevents vendor lock-in and avoids muddying the auth token with excessive metadata. We map authenticated users to our application users via an `ensureAppUser()` middleware/helper, which guarantees an `app_user` record exists upon the first authenticated session.

## Consequences
- All foreign keys for application entities (organizations, bookings) must point to `app_users.id`, never `auth.users.id`.
- The `ensureAppUser` pattern must be invoked globally or reliably upon login to ensure data consistency.
