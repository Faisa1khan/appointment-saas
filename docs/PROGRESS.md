# Arrivo Progress

This document tracks implementation progress across all epics and stories.

Update this document whenever a story is completed.

---

# Overall Progress

| Epic | Name | Status |
|------|------|--------|
| E1 | Platform Foundation | ✅ Completed |
| E2 | Core Booking Domain | 🟡 In Progress |
| E3 | Business Administration | ⚪ Not Started |
| E4 | Customer Experience | ⚪ Not Started |
| E5 | Growth Features | ⚪ Not Started |

---

# Current Epic

**Epic:** E2 – Core Booking Domain

**Status:** 🟡 In Progress

---

# Current Story

**Story ID:** E2.1-S2

**Title:** Service Categories (Create/Edit/Assign)

**Status:** 🟡 In Progress

---

# Completed Stories

- ✅ E0-S1 – Initialize Next.js 15 project with TypeScript, Tailwind CSS v4, and shadcn/ui
- ✅ E0-S2 – Configure Supabase project (Auth, database, storage) and connect to the app
- ✅ E0-S3 – Configure Drizzle ORM with initial schema and migration pipeline
- ✅ E0-S4 – Enable RLS on all tenant-scoped tables with correct policies
- ✅ E0-S5 – Configure Vercel deployment and CI/CD pipeline
- ✅ E0-S6 – Configure error logging and monitoring
- ✅ E0-S7 – Engineering Principles & Platform Foundation
- ✅ E1-S1 – As an owner, I can register with email and password
- ✅ E1-S1.5 – Authentication Experience Completion
- ✅ E1-S1.8 – Internationalization (i18n) Foundation
- ✅ E1-S2 – As an owner, I am prompted to create my organization immediately after registration
- ✅ E1-S3 – As an owner, I can set my business name, slug, timezone, and booking interval
- ✅ E1-S4 – As an owner, I can log in and log out
- ✅ Platform Compliance Audit – Resolved all remaining hardcoded UI text, theming issues, and applied strict Definition of Done
- ✅ Regionalization & Localization Standards – Established ADR-012, organization-level currency, locale, timezone, and week start day settings.
- ✅ Feature Capability System – Implemented a configuration-driven UI system for feature availability mapping.
- ✅ E2.1-S1 – Service Management (CRUD operations and ordering)

---

# Upcoming Stories

- ⏳ E2.2-S1 – Set weekly business hours
- ⏳ E2.2-S2 – Mark specific days or dates as closed (holidays)
- ⏳ E2.3-S1 – Add staff members and custom schedules
- ⏳ E2.4-S1 – Backend generates appointment slots with rules engine
- ⏳ E2.4-S2 – Backend conflict detection and atomic validation
- ⏳ E2.4-S3 – Create, reschedule, and cancel bookings

---

# Progress Rules

After every completed story:

1. Update the Overall Progress table.
2. Update the Current Epic progress.
3. Move the completed story from Upcoming Stories to Completed Stories.
4. Set the next story as the Current Story.
5. When all stories in an epic are complete:
   - Mark the epic as ✅ Completed.
   - Set the next epic to 🟡 In Progress.
6. Never modify or remove completed story history.

This document is the single source of truth for implementation progress.
