import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Replay may only be captured for errors in production to avoid noise
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  tracesSampleRate: 1.0,

  // Only enable Sentry on the client in production or when explicitly desired
  enabled: process.env.NODE_ENV === "production",

  // You can route Sentry requests through a Next.js API route to bypass ad-blockers.
  // tunnelRoute: "/monitoring",
});
