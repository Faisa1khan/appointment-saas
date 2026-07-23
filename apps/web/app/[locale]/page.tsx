import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { buttonVariants } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getTranslations } from "next-intl/server"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/app")
  }

  const t = await getTranslations('landing')
  const tCommon = await getTranslations('common')
  const tNav = await getTranslations('common.navigation')

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background relative">
      <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <main className="flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 space-y-8 max-w-3xl mx-auto flex-1 w-full">
        <div className="flex items-center gap-2 mb-8">
          <span className="bg-primary text-primary-foreground text-3xl font-bold rounded-lg p-2 h-12 w-12 flex items-center justify-center shadow-lg">A</span>
          <span className="text-3xl font-bold tracking-tight">{tCommon('brand.name')}</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
          {t.rich('hero.title', {
            br: () => <br className="hidden sm:inline" />,
            primary: (chunks) => <span className="text-primary">{chunks}</span>
          })}
        </h1>
        
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Link 
            href="/register" 
            className={buttonVariants({ size: 'lg', className: 'w-full sm:w-auto text-base font-semibold px-8 h-12' })}
          >
            {tNav('register')}
          </Link>
          <Link 
            href="/login" 
            className={buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full sm:w-auto text-base font-semibold px-8 h-12' })}
          >
            {tNav('login')}
          </Link>
        </div>
      </main>
    </div>
  )
}
