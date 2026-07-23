import { MailCheck } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VerifyEmailPage(props: Props) {
  const searchParams = await props.searchParams
  const email = searchParams.email as string | undefined
  const t = await getTranslations('auth.verifyEmail')

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {email 
            ? t.rich('description', { 
                email: () => <span className="font-medium text-foreground">{email}</span> 
              }) 
            : t('descriptionFallback')}
        </p>
      </div>
      <div className="space-y-4 pt-4">
        <p className="text-sm text-muted-foreground text-center">
          {t('notReceived')}
        </p>
        <Link href="/login" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  )
}
