import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

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

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { SentryProvider } from "../sentry-provider";
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "hi")) {
    notFound();
  }
  
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // Set html dir based on locale (for future RTL support)
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <SentryProvider>
            <Providers>{children}</Providers>
          </SentryProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
