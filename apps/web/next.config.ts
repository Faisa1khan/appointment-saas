import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Turbopack is enabled via `next dev --turbopack` (see package.json)
  // Server Components are the default with App Router
  experimental: {
    // Turbopack config can go here when needed
  },
};

const sentryConfig = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This is disabled in development so Turbopack sends errors directly to Sentry.
  ...(process.env.NODE_ENV === "production" ? { tunnelRoute: "/monitoring" } : {}),
});

export default withSerwist(withNextIntl(sentryConfig));
