import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/layout/user-nav"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"

export async function AppHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations("common.brand")

  if (!user) return null

  const appUser = await ensureAppUser(user)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div className="font-bold text-xl text-primary md:hidden">{t('name')}</div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <UserNav name={appUser.displayName || user.email || 'User'} email={user.email || ''} />
        </div>
      </div>
    </header>
  )
}
