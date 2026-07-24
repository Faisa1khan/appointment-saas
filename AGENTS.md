# AGENTS.md

This file defines the engineering standards for this repository.

Every AI agent working on this project MUST follow these rules.

---

# Project

Generic Multi-Tenant Appointment Booking SaaS

The fundamental engineering principles for this project are defined in `docs/ENGINEERING_PRINCIPLES.md`. All agents and contributors MUST follow these principles before reading any other rules.

---

# Technology Stack

The project's technology stack is defined in `docs/STACK.md`.

Do not introduce new libraries, frameworks, or architectural patterns without approval.

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
- Mobile-first responsive design.

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

# Design Principles

Keep the MVP simple.

Prefer configuration over complexity.

Build generic solutions.

Avoid industry-specific code.

Never optimize prematurely.

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

# Scope Control

Implement ONLY the requested story.

Do not:

- Refactor unrelated code.
- Upgrade dependencies.
- Add features from future stories.
- Introduce new libraries.
- Change architecture without approval.

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
10. Stop and wait for my review.

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

### Database Security
- [ ] Migration generated or registered with Drizzle
- [ ] Migration applied successfully
- [ ] Schema verified
- [ ] RLS verified (when applicable)
- [ ] Security Advisor reviewed
- [ ] No new critical security warnings