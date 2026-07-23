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

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
})

export function ForgotPasswordForm() {
  const [isPending, startTransition] = React.useTransition()
  const [isSubmitted, setIsSubmitted] = React.useState(false)

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
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We have sent a password reset link to your email address.
        </p>
        <div className="pt-4">
          <Link href="/login" className="text-sm underline underline-offset-4 hover:text-primary">
            Return to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we will send you a reset link.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            disabled={isPending}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive font-medium">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Sending link...' : 'Send reset link'}
        </Button>
        <div className="text-center text-sm">
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
