import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as "en" | "hi")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      common: (await import(`../messages/${locale}/common.json`)).default,
      auth: (await import(`../messages/${locale}/auth.json`)).default,
      landing: (await import(`../messages/${locale}/landing.json`)).default,
      onboarding: (await import(`../messages/${locale}/onboarding.json`)).default,
      services: (await import(`../messages/${locale}/services.json`)).default,
      staff: (await import(`../messages/${locale}/staff.json`)).default,
    }
  };
});
