# ADR-012: Regionalization and Localization

## Status
Accepted

## Context
A generic multi-tenant SaaS must support organizations operating in different countries. We cannot assume a single currency, timezone, date/time format, or locale across the entire application. Businesses in different regions require localized formats to properly serve their customers.

## Decision
* Organization has a `currency_code`. Currency uses **ISO 4217 codes** (e.g., INR, USD, EUR).
* Organization has a `timezone`. Timezone uses **IANA timezone names** (e.g., Asia/Kolkata, Europe/Berlin, America/New_York).
* Organization has a `locale`. Locale uses **BCP 47 language tags** (e.g., en-IN, en-US, fr-FR).
* Organization has a `week_starts_on` to define the start of the week (e.g. 0 = Sunday, 1 = Monday).
* Organization has a `date_format` (optional, if not derived from locale).
* Monetary values are stored in the **smallest currency unit** (cents/paise), **never** as floating-point values or decimals.
* Business logic never assumes a fixed currency.

### Formatting Responsibility
Formatting is strictly a UI concern. The database and backend should never return preformatted strings.

```
Database
↓
Stores integer amount (e.g., 1999)
↓
Business Logic
↓
Returns integer (e.g., 1999)
↓
UI
↓
Formats using organization locale + currency (e.g., "$19.99")
```

## Consequences
* The `organizations` table will serve as the source of truth for formatting throughout the application.
* The same codebase will work correctly for businesses globally (e.g., a salon in India, a clinic in Germany, a barber in the US) without modifications.
* All new features involving bookings, payments, invoices, and reporting must adhere to these settings instead of hardcoding any regional assumptions.
