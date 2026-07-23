"use client"

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: 'en' | 'hi') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-9 w-9 cursor-pointer" })}>
        <Globe className="h-4 w-4" />
        <span className="sr-only">Switch language</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('en')} className={locale === 'en' ? 'bg-accent' : ''}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('hi')} className={locale === 'hi' ? 'bg-accent' : ''}>
          हिंदी (Hindi)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
