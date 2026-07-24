# Future Architecture: Organization Settings

## Status

Future Consideration

## Motivation

Currently, `organizations` contains only a few regional settings:

- currency_code
- locale
- timezone
- week_starts_on

As the application grows, additional configuration may be added:

- booking interval
- cancellation policy
- payment settings
- notification preferences
- branding
- working days
- tax settings

At that point, consider moving configuration into a dedicated
`organization_settings` table.

Current design is intentionally simple for MVP.

This is **not** planned until the table becomes difficult to maintain.
