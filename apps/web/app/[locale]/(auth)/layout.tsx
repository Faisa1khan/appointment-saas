import * as React from "react"
import Link from "next/link"
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from "@/components/theme-toggle"
import { getTranslations } from "next-intl/server"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tCommon = await getTranslations('common')

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
          <span className="bg-primary text-primary-foreground rounded-md p-1">A</span>
          {tCommon('brand.name')}
        </Link>
      </div>
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
