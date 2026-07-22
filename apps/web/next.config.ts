import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is enabled via `next dev --turbopack` (see package.json)
  // Server Components are the default with App Router
  experimental: {
    // Turbopack config can go here when needed
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This is disabled in development so Turbopack sends errors directly to Sentry.
  ...(process.env.NODE_ENV === "production" ? { tunnelRoute: "/monitoring" } : {}),
});
