import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Arrivo",
    template: "%s | Arrivo",
  },
  description:
    "Modern multi-tenant booking and reservation platform for service businesses.",
  applicationName: "Arrivo",
  appleWebApp: {
    capable: true,
    title: "Arrivo",
    statusBarStyle: "default",
  },
};

import { SentryProvider } from "./sentry-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <SentryProvider>
          <Providers>{children}</Providers>
        </SentryProvider>
        <Toaster />
      </body>
    </html>
  );
}
