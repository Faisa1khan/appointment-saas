'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { forgotPassword } from '@/app/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'

const formSchema = z.object({
  email: z.string().email(),
})

export function ForgotPasswordForm() {
  const [isPending, startTransition] = React.useTransition()
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const t = useTranslations('auth.forgotPassword')
  const tErrors = useTranslations('auth.errors')
  const tVerify = useTranslations('auth.verifyEmail')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', values.email)

      const result = await forgotPassword(null, formData)

      if (result?.error) {
        toast.error(result.error)
        
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              // @ts-expect-error - field mapping
              form.setError(field, { type: 'server', message: messages[0] })
            }
          })
        }
        return
      }

      if (result?.success) {
        if (result.message) toast.success(result.message)
        setIsSubmitted(true)
      }
    })
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{tVerify('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {tVerify('descriptionFallback')}
        </p>
        <div className="pt-4">
          <Link href="/login" className="text-sm underline underline-offset-4 hover:text-primary min-h-[44px] flex items-center justify-center">
            {tVerify('backToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('emailLabel')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            disabled={isPending}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive font-medium">
              {tErrors('invalidEmail')}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? '...' : t('submitButton')}
        </Button>
        <div className="text-center text-sm">
          <Link href="/login" className="underline underline-offset-4 hover:text-primary min-h-[44px] flex items-center justify-center">
            {t('backToLogin')}
          </Link>
        </div>
      </form>
    </div>
  )
}
