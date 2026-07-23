# Engineering Principles

Arrivo is a modern SaaS appointment scheduling platform. These principles serve as the permanent constitution for all future development. Every implementation should follow these principles unless explicitly overridden.

---

## Product Philosophy

- User experience is the highest priority.
- Build simple, scalable, maintainable solutions.
- Avoid over-engineering while keeping future scalability in mind.

---

## Mobile First

Arrivo is designed mobile-first. Every screen must be designed for:

- 360px
- 375px
- 390px
- 430px

Desktop should enhance the experience rather than define it. Every future page must be responsive by default.

---

## Progressive Web App

Arrivo is an installable application. Future features must:

- Work in standalone mode.
- Avoid browser-only assumptions.
- Handle offline scenarios gracefully.
- Support touch-first interactions.

The application should support:
- Install to Home Screen
- Standalone mode
- Offline-ready architecture
- Fast loading
- Native-like experience

---

## Theme Support

Every component must support:

- Light
- Dark
- System (Default)

Never hardcode colors. Always use design tokens or CSS variables. Every new component must automatically work in both themes.

---

## Design Tokens

All visual values should come from shared design tokens.

This includes:
- Colors
- Typography
- Border radius
- Shadows
- Spacing
- Animation durations
- Z-index layers

Avoid hardcoded values whenever possible.

---

## Accessibility

Every page should support:

- Keyboard navigation
- Screen readers
- Proper semantic HTML
- Accessible labels
- Focus states
- Good color contrast

---

## Performance

Performance is a feature.

Prefer:
- Server Components
- Lazy loading
- Code splitting
- Optimized images
- Streaming when appropriate

Avoid unnecessary client components.

---

## User Experience

Every async action must have:

- Loading state
- Success state
- Error state

Users should never wonder whether something is happening.

---

## Design System

Always reuse components.

Follow consistent:
- Spacing
- Typography
- Colors
- Icons
- Borders
- Shadows

Avoid duplicated UI.

---

## Architecture

Maintain clear separation between:

- UI
- Business Logic
- Validation
- Data Access
- Server Actions

Prefer reusable components. Avoid duplicated code.

---

## Code Quality

Every implementation must:

- Pass TypeScript
- Pass ESLint
- Pass production build

Keep code clean and maintainable.

---

## Scalability

Every implementation should consider future support for:

- Multiple organizations
- Multiple locations
- Additional business types
- Internationalization
- Offline capabilities

Avoid decisions that make future expansion difficult.

---

## Browser Support

Supported:
- Chrome (latest)
- Edge (latest)
- Safari (latest)
- Firefox (latest)

Mobile:
- Chrome Android
- Safari iOS

---

## Responsive Testing Checklist

Require testing in:
- Portrait
- Landscape
- Mobile Safari
- Chrome Android
- Tablet
- Desktop

---

## Definition of Done

A story is complete only if:

- [ ] Mobile responsive
- [ ] Light theme supported
- [ ] Dark theme supported
- [ ] System theme supported
- [ ] Accessible
- [ ] Keyboard navigable
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] Empty states implemented (where applicable)
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] Production build succeeds
