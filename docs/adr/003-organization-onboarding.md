# ADR 003: Organization Onboarding

## Context
When a user signs up, they typically intend to create a business entity to manage their scheduling. The initial design coupled registration directly with organization creation in a single step, making the registration form bulky.

## Decision
We decoupled registration from organization creation, shifting organization creation into a dedicated, multi-step Onboarding Wizard that appears post-login if the user lacks an organization.

## Why this approach was chosen
- Improves the initial conversion rate by minimizing required fields at sign-up.
- Provides a cleaner, focused onboarding experience (Welcome -> Business Info -> Review) reducing user errors.
- Adheres to the principle that "Onboarding should always ask for the minimum information required."

## Consequences
- The application layout must globally verify organization membership (`ensureAppUser` and subsequent checks).
- If a user closes the browser mid-onboarding, they will be dropped back into the wizard upon their next login.
