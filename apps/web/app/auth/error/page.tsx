import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTranslations } from 'next-intl/server'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const errorType = resolvedParams.error as string | undefined
  let message = resolvedParams.message as string | undefined
  const t = await getTranslations('auth.errorPage')
  const tCommon = await getTranslations('common.navigation')

  // Map common Supabase error types to friendly messages
  if (errorType === 'otp_expired' || errorType === 'access_denied') {
    if (!message || message.includes('Email link is invalid or has expired')) {
      message = 'The verification link is invalid or has expired. This often happens if you click a link more than once, or if your email provider pre-scans links for security.'
    }
  } else if (!message) {
    message = 'An unexpected authentication error occurred.'
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="text-center border-destructive/20 shadow-sm">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription className="text-base mt-2">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              <div className="flex flex-col gap-2">
                <Link href="/register" className={buttonVariants({ className: 'w-full min-h-[44px]' })}>
                  {tCommon('register')}
                </Link>
                <Link href="/login" className={buttonVariants({ variant: 'outline', className: 'w-full min-h-[44px]' })}>
                  {tCommon('login')}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
