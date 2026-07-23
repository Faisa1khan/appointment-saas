'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { updatePassword } from '@/app/actions/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'

const formSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export function ResetPasswordForm() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('password', values.password)

      const result = await updatePassword(null, formData)

      if (result?.error) {
        toast.error(result.error)
        
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              // @ts-expect-error - mapping
              form.setError(field, { type: 'server', message: messages[0] })
            }
          })
        }
        return
      }

      if (result?.success) {
        if (result.message) toast.success(result.message)
        if (result.redirectUrl) {
          router.push(result.redirectUrl)
        }
      }
    })
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Please enter your new password below.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <PasswordInput
            id="password"
            placeholder="********"
            disabled={isPending}
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive font-medium">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Updating...' : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
