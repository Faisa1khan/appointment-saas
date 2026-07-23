"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { login } from "@/app/actions/auth"
import { useTranslations } from "next-intl"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const t = useTranslations('auth.login')
  const tErrors = useTranslations('auth.errors')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", values.email)
      formData.append("password", values.password)

      const result = await login(null, formData)

      if (result?.error) {
        toast.error(result.error)
        
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              // @ts-expect-error - Field may not exist in exact type but we want to map server errors
              form.setError(field, { type: "server", message: messages[0] })
            }
          })
        }
        return
      }

      if (result?.success) {
        router.push("/app")
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          disabled={isPending}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive font-medium">
            {tErrors('invalidEmail')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t('passwordLabel')}</Label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
          >
            {t('forgotPasswordLink')}
          </Link>
        </div>
        <PasswordInput
          id="password"
          placeholder="********"
          disabled={isPending}
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive font-medium">
            {form.formState.errors.password.message || tErrors('generic')}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "..." : t('submitButton')}
      </Button>
      <div className="text-center text-sm">
        {t('noAccount')}{" "}
        <Link href="/register" className="underline underline-offset-4 hover:text-primary">
          {t('registerLink')}
        </Link>
      </div>
    </form>
  )
}
