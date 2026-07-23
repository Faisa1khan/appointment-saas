"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import debounce from "lodash.debounce"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { checkSlugAvailability, completeOnboarding } from "@/app/actions/onboarding"
import { Check, X, Loader2, ArrowRight } from "lucide-react"

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
]

const formSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  timezone: z.string().min(1),
})

type FormData = z.infer<typeof formSchema>

export function OnboardingWizard({ defaultTimezone = "UTC" }: { defaultTimezone?: string }) {
  const t = useTranslations("onboarding")
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1) // 4 is success
  
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const resolvedTimezone = TIMEZONES.includes(defaultTimezone) ? defaultTimezone : "UTC"

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      timezone: resolvedTimezone,
    },
    mode: "onChange",
  })

  const name = form.watch("name")
  const slug = form.watch("slug")
  
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false)

  useEffect(() => {
    if (!hasManuallyEditedSlug && name) {
      const generated = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      form.setValue("slug", generated, { shouldValidate: true })
    }
  }, [name, hasManuallyEditedSlug, form])

  const checkSlug = useMemo(
    () =>
      debounce(async (s: string) => {
        if (!s || s.length < 2) {
          setSlugStatus("idle")
          return
        }
        setSlugStatus("checking")
        const { available } = await checkSlugAvailability(s)
        setSlugStatus(available ? "available" : "taken")
      }, 500),
    []
  )

  useEffect(() => {
    if (slug) {
      checkSlug(slug)
    } else {
      setSlugStatus("idle")
    }
  }, [slug, checkSlug])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    const result = await completeOnboarding(data)
    
    if (result.success) {
      setStep(4)
    } else if (result.fieldErrors) {
      if (result.fieldErrors.name) form.setError("name", { message: result.fieldErrors.name[0] })
      if (result.fieldErrors.slug) {
        form.setError("slug", { message: result.fieldErrors.slug[0] })
        setSlugStatus("taken")
      }
      setIsSubmitting(false)
      setStep(2)
    } else {
      form.setError("root", { message: result.error || "Something went wrong" })
      setIsSubmitting(false)
    }
  }

  const WizardContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-md mx-auto space-y-8 bg-card p-8 rounded-xl shadow-sm border border-border">
      {step < 4 && (
        <div className="flex items-center justify-between text-sm font-medium mb-8">
          <span className={step >= 1 ? "text-primary" : "text-muted-foreground"}>{t('steps.account')} ✓</span>
          <div className="h-px bg-border flex-1 mx-4" />
          <span className={step >= 2 ? "text-primary" : "text-muted-foreground"}>
            {t('steps.business')} {step === 2 ? "●" : step > 2 ? "✓" : ""}
          </span>
          <div className="h-px bg-border flex-1 mx-4" />
          <span className={step === 3 ? "text-primary" : "text-muted-foreground"}>{t('steps.finish')}</span>
        </div>
      )}
      {children}
    </div>
  )

  if (step === 1) {
    return (
      <WizardContainer>
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button className="w-full mt-8" size="lg" onClick={() => setStep(2)}>
          {t('continue')} <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </WizardContainer>
    )
  }

  if (step === 2) {
    return (
      <WizardContainer>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{t('business_details')}</h2>
            <p className="text-sm text-muted-foreground">{t('business_details_sub')}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('business_name')} <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder={t('business_name_placeholder')}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">{t('business_url')}</Label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground sm:text-sm">
                  arrivo.app/
                </span>
                <Input
                  id="slug"
                  className="rounded-l-none"
                  {...form.register("slug")}
                  onChange={(e) => {
                    setHasManuallyEditedSlug(true)
                    form.setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""), { shouldValidate: true })
                  }}
                />
              </div>
              
              <div className="text-sm min-h-[20px]">
                {slugStatus === "checking" && <span className="text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> {t('checking')}</span>}
                {slugStatus === "available" && slug.length >= 2 && <span className="text-green-600 dark:text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> {t('available')}</span>}
                {slugStatus === "taken" && <span className="text-destructive flex items-center gap-1"><X className="w-3 h-3" /> {t('taken')}</span>}
                {form.formState.errors.slug && <span className="text-destructive">{form.formState.errors.slug.message}</span>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">{t('timezone')}</Label>
              <Select 
                value={form.watch("timezone")} 
                onValueChange={(v: string | null) => v && form.setValue("timezone", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('timezone_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => {
                form.trigger(["name", "slug"]).then(isValid => {
                  if (isValid && slugStatus === "available") setStep(3)
                })
              }}
              disabled={!name || !slug || slugStatus !== "available" || form.formState.errors.name !== undefined}
            >
              {t('continue')}
            </Button>
          </div>
        </div>
      </WizardContainer>
    )
  }

  if (step === 3) {
    const values = form.getValues()
    return (
      <WizardContainer>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{t('review')}</h2>
            <p className="text-sm text-muted-foreground">{t('review_sub')}</p>
          </div>

          <div className="space-y-4 bg-muted/50 p-4 rounded-lg border border-border">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm text-muted-foreground font-medium">{t('business_name')}</span>
              <span className="col-span-2 text-sm font-semibold">{values.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm text-muted-foreground font-medium">{t('booking_url')}</span>
              <span className="col-span-2 text-sm">arrivo.app/<strong>{values.slug}</strong></span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm text-muted-foreground font-medium">{t('timezone')}</span>
              <span className="col-span-2 text-sm">{values.timezone}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-sm text-muted-foreground font-medium">{t('booking_interval')}</span>
              <span className="col-span-2 text-sm">{t('30_minutes')}</span>
            </div>
          </div>

          {form.formState.errors.root && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
              {form.formState.errors.root.message}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setStep(2)} disabled={isSubmitting}>
              {t('back')}
            </Button>
            <Button 
              className="flex-1" 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('creating')}
                </>
              ) : (
                t('create_business')
              )}
            </Button>
          </div>
        </div>
      </WizardContainer>
    )
  }

  return (
    <WizardContainer>
      <div className="space-y-6 text-center py-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">{t('success_title')}</h2>
        <p className="text-xl text-muted-foreground">{t('success_sub')}</p>
        
        <div className="pt-8">
          <Button size="lg" className="w-full" onClick={() => router.push("/app/dashboard")}>
            {t('go_to_dashboard')}
          </Button>
        </div>
      </div>
    </WizardContainer>
  )
}
