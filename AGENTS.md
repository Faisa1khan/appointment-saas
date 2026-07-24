# AGENTS.md

This file defines the engineering standards for this repository.

Every AI agent working on this project MUST follow these rules.

---

# Rule Priority

If two rules appear to conflict, follow this order:

1. Security
2. Documentation
3. Architecture
4. Business Requirements
5. Engineering Principles
6. Coding Standards
7. UI Guidelines
8. Personal Preference

If the conflict cannot be resolved using this order:

STOP

Explain the conflict and ask for clarification.

---

# AI Agent Behavior

The agent MUST:

- Think before implementing.
- Prefer existing project patterns over creating new ones.
- Reuse existing components whenever possible.
- Explain architectural decisions before making them.
- Identify risks before implementation.
- Never silently change conventions.
- Ask for approval before making architectural or UX changes.
- Keep solutions as simple as possible for the current story.

---

# Project

Generic Multi-Tenant Appointment Booking SaaS

The fundamental engineering principles for this project are defined in `docs/ENGINEERING_PRINCIPLES.md`. All agents and contributors MUST follow these principles before reading any other rules.

---

# Technology Stack

The project's technology stack is defined in `docs/STACK.md`.

Do not introduce new libraries, frameworks, or architectural patterns without approval.

Always prefer existing project utilities, components, hooks, and abstractions before creating new ones.

---

# Coding Rules

- Use TypeScript only.
- Never use JavaScript files.
- Prefer Server Components.
- Use Client Components only when necessary.
- Keep components small and reusable.
- Avoid unnecessary abstraction.
- Prefer composition over inheritance.

---

# UI Rules

- Use shadcn/ui components.
- Do not install another UI library.
- Use Tailwind utilities.
- Maintain consistent spacing.
- **Arrivo is a mobile-first SaaS. Every feature must be designed, implemented, and tested on a mobile viewport (390px) before being optimized for larger screens. Desktop enhances the experience but is never the primary design target.**
- Prefer cards over wide tables.
- Use bottom sheets or full-screen dialogs instead of tiny centered modals on mobile.
- Keep primary actions easy to reach with one thumb.

---

# Reusable Components

Every reusable UI component MUST:

- Be mobile-first by default.
- Support responsive layouts without feature-specific modifications.
- Avoid hardcoded dimensions unless documented.
- Expose configuration through props rather than duplication.
- Remain consistent with the project's design system.

---

# Accessibility

Every UI must:

- Use semantic HTML.
- Include accessible labels.
- Support keyboard navigation where appropriate.
- Never rely solely on color to convey meaning.
- Maintain sufficient color contrast.

---

# Performance

- Prefer Server Components.
- Avoid unnecessary Client Components.
- Avoid unnecessary re-renders.
- Lazy load large client-side features when appropriate.
- Keep bundle size minimal.

---

## Mobile UX Review (Required)

Before implementing any new feature, the agent MUST consider the mobile experience first.

The implementation order is:

1. Mobile (390–430px)
2. Tablet (768px)
3. Desktop (1024px+)

The agent should never implement a desktop layout first and later adapt it for mobile.

### UI Guidelines

- Prefer vertical layouts on mobile.
- Avoid multi-column forms on screens smaller than `sm`.
- Avoid hover-only interactions.
- Prefer cards over tables on mobile.
- Use drawers or full-screen dialogs on mobile.
- Primary actions should be visible without horizontal scrolling.
- Touch targets must be at least 44×44px.
- Avoid hidden functionality that depends on hover.
- Navigation should remain fully usable with one hand.
- Minimize typing whenever possible.

---

# Database Rules

- Never modify the schema without updating DATABASE.md.
- Follow naming conventions.
- Use UUID primary keys.
- Use foreign keys.
- Use timestamps.

---

# API Rules

- Follow API.md.
- Do not invent endpoints.
- Validate every request with Zod.
- Return consistent error responses.

---

# Business Rules

Always follow:

- PRD.md
- ARCHITECTURE.md
- USER_FLOWS.md
- SCENARIOS.md
- DATABASE.md

Do not make assumptions.

If documentation is unclear:

STOP

Ask for clarification instead of implementing.

---

# Architecture

The system is API-first.

Business logic belongs in the backend.

The frontend should never calculate booking availability.

Availability is always computed by the backend.

---

# Architecture Decisions

The agent MUST NOT introduce architectural changes without first updating or creating the appropriate ADR.

If a story requires changing an existing architectural decision:

1. STOP
2. Explain the conflict.
3. Update the ADR.
4. Wait for approval before implementation.

Implementation must follow approved architecture.

---

# Feature Architecture

Every new feature MUST follow the project's feature structure.

- Business logic belongs inside the feature.
- UI components belong inside the feature.
- Validation belongs inside the feature.
- Server Actions belong inside the feature.
- Shared code belongs in shared libraries only when reused by multiple features.

Pages should remain thin and primarily compose feature modules.

---

# Design Principles

Keep the MVP simple.

Prefer configuration over complexity.

Build generic solutions.

Avoid industry-specific code.

Never optimize prematurely.

---

# Localization

The platform is designed for global use.

Never assume:

- Currency
- Timezone
- Date format
- Time format
- Language
- Locale

Business-specific regional settings must be configurable and stored at the organization level.

Prices should always be stored in the smallest currency unit (for example, cents or paise) and formatted according to the organization's configured currency and locale.

---

# Implementation Workflow

Before implementing any story:

1. Read `AGENTS.md`.
2. Read the story requirements.
3. Read only the documentation relevant to the current story.
4. If documentation is missing, unclear, or inconsistent, STOP and report the issue.
5. Implement ONLY the current story.
6. If documentation and implementation conflict, documentation wins.
7. Never introduce new libraries, frameworks, or architectural patterns without approval.

---

# Implementation Plan Guidelines

Every `implementation_plan.md` MUST include a **Mobile Review** section before execution:

```md
## Mobile Review

Before implementation, verify:

- [ ] Works at 390px
- [ ] No horizontal scrolling
- [ ] No hover-only interactions
- [ ] Forms stack correctly
- [ ] Touch targets >= 44px
- [ ] Primary CTA reachable
- [ ] Dialogs usable on mobile
- [ ] Navigation works on mobile
```

---

# Scope Control

Implement ONLY the requested story unless an unrelated change is required to fix a bug, maintain consistency, or satisfy an existing engineering standard. If such a change is required, explain it before making it.

Do not:

- Refactor unrelated code.
- Upgrade dependencies.
- Add features from future stories.
- Introduce new libraries.
- Change architecture without approval.

---

# Technical Debt

Do not leave unfinished work.

Avoid:

- TODO comments
- Placeholder implementations
- Mock data
- Temporary workarounds
- Dead code

If a story cannot be completed properly, STOP and explain why instead of leaving partial implementations.

---

# Learning Workflow

Learning is part of the project's Definition of Done.

For every completed story, the agent MUST:

1. Update `docs/LEARNING.md`.
2. Append a new learning entry for the completed story.
3. Never overwrite previous learning entries.
4. Follow the standard Learning Journal template.
5. Explain concepts from first principles.
6. Use examples from the Arrivo codebase whenever possible.
7. Explain not only *what* was implemented, but also *why* it was implemented that way.
8. Include:
   - Objective
   - What We Built
   - Why We Built It This Way
   - Concepts to Master
   - Vocabulary
   - Files to Study
   - Technologies Introduced
   - Best Practices
   - Common Mistakes
   - Architecture Decisions
   - Where This Will Be Used
   - Common Interview Questions
   - Exercises
   - Further Reading
   - Revision Checklist
   - Key Takeaways

---

# Progress Tracking

After every completed story, update `docs/PROGRESS.md` before stopping.

`docs/PROGRESS.md` is the authoritative record of implementation progress across all epics and stories.

---

# Documentation Priority

Documentation is the source of truth.

When implementing a story:

- Read the relevant documentation before writing code.
- If implementation conflicts with documentation, STOP and report the conflict.
- Never silently change architecture or design decisions.
- Any architectural change must first update the appropriate documentation before implementation continues.

---

# Quality Gates

A story cannot be completed unless:

- Lint passes.
- Type checking passes.
- Build passes (when applicable).

Never ignore failing quality checks.

---

# Story Completion Workflow

Every completed story MUST follow this order:

1. Implement only the current story.
2. Run:
   - lint
   - typecheck
   - build (when applicable)
3. Fix all issues.
4. Update affected documentation.
5. Update `docs/LEARNING.md`.
6. Update `docs/PROGRESS.md`.
7. Perform a self-review.
8. Summarize the implementation.
9. Suggest a Conventional Commit message.
10. For UI stories include:
    - Before screenshots (if modifying an existing feature)
    - After screenshots
    - Mobile (390px)
    - Tablet (768px)
    - Desktop (1024px+)
    - Explain any UX decisions that changed user behaviour.
11. Stop and wait for my review.

Never continue to the next story automatically.

---

# Git Workflow

For every completed story:

- Stage only the files related to that story.
- Suggest a Conventional Commit message.
- Do not commit automatically.
- Wait for my approval before committing.
- Do not start the next story until the current story has been reviewed and committed.

---

# Goal

Every story should be:

- Documented
- Implemented
- Verified
- Learned
- Reviewed
- Ready to Commit

Only proceed to the next story after my approval.

## Definition of Done

A story is NOT considered complete until:

- [ ] Requirements are implemented.
- [ ] Lint passes.
- [ ] Type checking passes.
- [ ] Build passes (when applicable).
- [ ] Self-review completed.
- [ ] Relevant documentation has been updated (if required).
- [ ] `docs/LEARNING.md` has been updated with a new entry following the Learning Workflow.
- [ ] `docs/PROGRESS.md` has been updated following the Progress Rules.

### Mobile First QA Gate
- [ ] Designed at 390px first
- [ ] Tested on 390px viewport
- [ ] No horizontal scrolling
- [ ] All interactive controls meet touch target guidelines (at least 44x44px)
- [ ] Forms are usable with one hand
- [ ] Drawer closes after navigation
- [ ] No hover-only interactions
- [ ] Dialogs appropriate for mobile (fullscreen/drawer when required)
- [ ] Tablet (768px) layout verified
- [ ] Desktop (1024px+) layout verified

### Database Security
- [ ] Migration generated or registered with Drizzle
- [ ] Migration applied successfully
- [ ] Schema verified
- [ ] RLS verified (when applicable)
- [ ] Security Advisor reviewed
- [ ] No new critical security warnings