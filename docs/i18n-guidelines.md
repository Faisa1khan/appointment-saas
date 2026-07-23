# Internationalization (i18n) Guidelines

This document outlines the standard practices for internationalization in the Arrivo codebase. All contributors must follow these guidelines to ensure a scalable and maintainable global product.

## 1. What to Translate (and What NOT to Translate)

**DO Translate:**
- UI labels, buttons, and navigation (e.g., "Login", "Dashboard").
- Tooltips, placeholders, and form validation error messages.
- Marketing copy on the landing page.

**DO NOT Translate:**
- **Database Content / User-Generated Content**: Service names (e.g., "Haircut"), Customer names, Organization names, Resource names. These are created by users and should be displayed exactly as entered.
- **Developer Messages**: Console logs, internal error codes, or technical comments.
- **Branding**: The name "Arrivo" should generally remain untranslated unless a specific localization strategy dictates otherwise.

## 2. Supported Languages

For the MVP, we support:
- `en` - English (Default)
- `hi` - Hindi

Additional languages will be added to `apps/web/i18n/routing.ts` as needed.

## 3. Translation File Structure

We use nested translation files within a language directory to keep the dictionaries manageable.

```text
apps/web/messages/
  [locale]/
    common.json    # Generic words: Save, Cancel, Yes, No
    auth.json      # Login, Register, Password Reset
    landing.json   # Marketing copy
    dashboard.json # App shell and dashboard specific
```

## 4. Namespaces and Key Structure

Always use namespaces to group related translations. Do not use generic, top-level keys.

**Good:**
```json
// common.json
{
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "errors": {
    "invalidEmail": "Please enter a valid email address."
  }
}
```
Usage: `t('buttons.save')`

**Bad:**
```json
{
  "saveButton": "Save",
  "invalidEmailError": "Please enter a valid email address."
}
```

## 5. Interpolation and Plurals

Use ICU message syntax for dynamic values.

**Interpolation:**
```json
{
  "welcome": "Welcome back, {name}!"
}
```
Usage: `t('welcome', { name: user.name })`

**Plurals:**
```json
{
  "bookingCount": "You have {count, plural, =0 {no bookings} one {1 booking} other {# bookings}}."
}
```

## 6. Formatting

Do not hardcode date, time, or currency formats. Rely on the browser's native `Intl` APIs or the formatting functions provided by `next-intl`.

- **Dates**: Use locale-aware formatting (e.g., MM/DD/YYYY vs DD/MM/YYYY).
- **Numbers & Currency**: Ensure decimals and separators respect the user's locale.

## 7. RTL (Right-to-Left) Guidelines

The architecture is prepared for RTL languages (e.g., Arabic, Hebrew). 
When styling components, **never use physical directional properties** if a logical property exists.

**Bad:**
```css
margin-left: 1rem;
padding-right: 0.5rem;
text-align: left;
```

**Good:**
```css
margin-inline-start: 1rem; /* left in LTR, right in RTL */
padding-inline-end: 0.5rem;
text-align: start;
```

In Tailwind CSS, use the logical variants:
- `ms-4` (margin-inline-start) instead of `ml-4`
- `pe-2` (padding-inline-end) instead of `pr-2`
- `text-start` instead of `text-left`

## 8. Language Persistence Priority

Language resolution follows this priority:
1. **Saved Preference**: (Future) User's profile setting in the database.
2. **Cookie / Browser Language**: Detected automatically by the middleware based on `Accept-Language` headers or previous visits.
3. **English**: The default fallback.
