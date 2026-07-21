"use client";

import { ThemeProvider } from "next-themes";

/**
 * Providers
 *
 * Wraps the app with all client-side context providers.
 * Add new providers here as needed (e.g. React Query, Toaster).
 *
 * Usage: Render <Providers> inside the root layout's <body>.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
