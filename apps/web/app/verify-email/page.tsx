import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MailCheck } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <MailCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a verification link. Please check your email to verify your account and continue onboarding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or try registering again.
              </p>
              <Link href="/login" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
                Return to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
