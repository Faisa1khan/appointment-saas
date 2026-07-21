import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is enabled via `next dev --turbopack` (see package.json)
  // Server Components are the default with App Router
  experimental: {
    // Turbopack config can go here when needed
  },
};

export default nextConfig;
