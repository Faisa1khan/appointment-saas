# 10. Disable Turbopack for Local Development

Date: 2024-06-XX

## Status

Accepted

## Context

Next.js provides an experimental `turbopack` compiler for faster local development builds (`next dev --turbopack`). We initially had this enabled in our `dev` script in `apps/web/package.json`.

However, as we integrated production-grade observability and PWA tools, we encountered two significant issues:
1. **Sentry Instrumentation Crash**: `@sentry/nextjs` relies on `require-in-the-middle` (via OpenTelemetry) for monkey-patching and tracing. Turbopack's module resolution fails to load this dynamically required native module, resulting in a fatal `Cannot find module 'require-in-the-middle-...'` error on startup.
2. **Serwist Warning**: `@serwist/next`, our PWA service worker provider, explicitly warns on startup that it does not currently support Turbopack and recommends falling back to the standard Webpack compiler.

## Decision

We will intentionally disable Turbopack for local development and fall back to the standard Next.js Webpack compiler by using `next dev`.

## Consequences

* **Positive**: The local development server will start reliably without crashing, allowing developers to work on the application smoothly. We maintain full compatibility with our observability stack (Sentry) and PWA plugin (Serwist).
* **Negative**: Local development builds and hot module replacement (HMR) will be slightly slower compared to Turbopack.

## Future Review

This decision should be revisited when:
1. Sentry officially announces full Turbopack support for their Next.js instrumentation.
2. Serwist ships stable support for Turbopack.
