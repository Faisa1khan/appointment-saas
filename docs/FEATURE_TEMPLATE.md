# Feature Module Template

As the codebase grows, we organize new business logic into distinct, cohesive "feature folders". This ensures that logic, components, and schemas related to a specific domain (e.g., Services, Bookings) remain collocated and maintainable.

## Standard Structure

Every new major feature should follow this directory pattern:

```text
features/[feature-name]/
├── actions/       # Server actions (e.g., createService.ts, updateBooking.ts)
├── components/    # Feature-specific React components
├── hooks/         # Feature-specific React hooks
├── schemas/       # Zod validation schemas
├── types/         # TypeScript interfaces and types
├── lib/           # Feature-specific utilities and helpers
├── page.tsx       # Main page entry point (if applicable)
├── loading.tsx    # Suspense fallback
└── error.tsx      # Error boundary
```

## Example: `features/services/`

```text
features/services/
├── actions/
│   ├── create-service.ts
│   └── delete-service.ts
├── components/
│   ├── service-card.tsx
│   └── service-form.tsx
├── hooks/
│   └── use-services.ts
├── schemas/
│   └── service.schema.ts
├── types/
│   └── index.ts
├── page.tsx
├── loading.tsx
└── error.tsx
```

## Guidelines

- **Encapsulation:** Try to keep everything a feature needs inside its own folder. If multiple features need a component or helper, only then should it be moved to the global `components/` or `lib/` directories.
- **Server Actions:** Keep database mutations and sensitive operations in the `actions/` folder, ensuring they are marked with `'use server'`.
- **Validation:** Always define input payloads using Zod schemas in `schemas/` and share them between the client forms and Server Actions.
- **Collocation:** Route segments (`page.tsx`, `loading.tsx`) can live directly inside the feature folder if utilizing Next.js App Router route groups or if the feature folder acts as a route segment itself.
