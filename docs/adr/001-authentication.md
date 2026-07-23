# ADR 001: Authentication

## Context
We need a robust, secure, and scalable authentication system for our multi-tenant SaaS application. We considered building our own JWT-based auth or using an external identity provider.

## Decision
We chose Supabase Auth as our identity provider.

## Why this approach was chosen
Supabase provides out-of-the-box support for email/password, OAuth, Magic Links, and robust session management via secure HttpOnly cookies (`@supabase/ssr`). It eliminates the operational overhead of managing secure password hashes and session lifecycles, and integrates seamlessly into our Next.js App Router architecture.

## Consequences
- We must maintain strict separation between Supabase's internal `auth.users` schema and our application-specific user data.
- We rely on Supabase's downtime and SLA for auth, though this is a standard industry tradeoff.
