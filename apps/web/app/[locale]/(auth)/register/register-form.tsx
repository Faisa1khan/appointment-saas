'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { registerOwner } from '@/app/actions/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { useTranslations } from 'next-intl'

const formSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export function RegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const t = useTranslations('auth.register')
  const tErrors = useTranslations('auth.errors')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('firstName', values.firstName)
      formData.append('lastName', values.lastName)
      formData.append('email', values.email)
      formData.append('password', values.password)

      const result = await registerOwner(null, formData)

      if (result?.error) {
        toast.error(result.error)
        
        // Handle field level errors if they exist
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              form.setError(field as any, { type: 'server', message: messages[0] })
            }
          })
        }
        return
      }

      if (result?.success) {
        if (result.message) {
          toast.success(result.message)
        }
        if (result.redirectUrl) {
          router.push(result.redirectUrl)
        } else {
          // Fallback if email verification is enabled and no redirect provided
          router.push('/verify-email')
        }
      }
    })
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('firstNameLabel')}</Label>
            <Input
              id="firstName"
              placeholder="John"
              disabled={isPending}
              {...form.register('firstName')}
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive font-medium">
                {form.formState.errors.firstName.message || tErrors('generic')}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t('lastNameLabel')}</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              disabled={isPending}
              {...form.register('lastName')}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive font-medium">
                {form.formState.errors.lastName.message || tErrors('generic')}
              </p>
            )}
          </div>
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="password">{t('passwordLabel')}</Label>
          <PasswordInput
            id="password"
            placeholder="********"
            disabled={isPending}
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive font-medium">
              {form.formState.errors.password.message || tErrors('passwordTooShort')}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? '...' : t('submitButton')}
        </Button>
        <div className="text-center text-sm">
          {t('hasAccount')}{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            {t('loginLink')}
          </Link>
        </div>
      </form>
    </div>
  )
}
