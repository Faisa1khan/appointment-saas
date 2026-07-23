import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'hi'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // Only adds /hi/ to the URL, /en/ is hidden
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
