"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { serviceSchema } from "../schemas/service.schema"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState, useTransition } from "react"
import { createService, updateService } from "../actions/service.actions"
import { toast } from "sonner"

import { type Service, type Category } from "../types"

interface ServiceFormProps {
  service?: Service | null
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ServiceForm({ service, categories, open, onOpenChange, onSuccess }: ServiceFormProps) {
  const t = useTranslations("services")
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      durationMinutes: service?.durationMinutes || 30,
      price: service ? service.price / 100 : 0, // Convert minor units to display
      currency: service?.currency || "USD",
      color: (service?.color as "blue" | "green" | "orange" | "purple" | "pink" | "red" | "yellow" | "gray") || "blue",
      categoryId: service?.categoryId || null,
      isActive: service?.isActive ?? true,
    },
  })

  function onSubmit(data: z.infer<typeof serviceSchema>) {
    startTransition(async () => {
      // Convert display price back to minor units
      const submissionData = {
        ...data,
        price: Math.round(data.price * 100)
      }

      if (service) {
        const result = await updateService(service.id, submissionData)
        if (result.success) {
          toast.success(t("messages.updated"))
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(t("messages.error"))
        }
      } else {
        const result = await createService(submissionData)
        if (result.success) {
          toast.success(t("messages.created"))
          onSuccess()
          onOpenChange(false)
          form.reset()
        } else {
          toast.error(t("messages.error"))
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{service ? t("form.editTitle") : t("form.createTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input id="name" placeholder={t("form.namePlaceholder")} {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message as string}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t("form.description")}</Label>
            <Textarea 
              id="description"
              placeholder={t("form.descriptionPlaceholder")} 
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">{t("form.duration")}</Label>
              <Input 
                id="durationMinutes"
                type="number" 
                {...form.register("durationMinutes", { valueAsNumber: true })}
              />
              {form.formState.errors.durationMinutes && (
                <p className="text-sm text-destructive">{form.formState.errors.durationMinutes.message as string}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">{t("form.price")}</Label>
              <Input 
                id="price"
                type="number" 
                step="0.01"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">{form.formState.errors.price.message as string}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">{t("form.color")}</Label>
            <Controller
              control={form.control}
              name="color"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value || "blue"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['blue', 'green', 'orange', 'purple', 'pink', 'red', 'yellow', 'gray'].map(color => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `var(--${color}-500, ${color})` }} />
                          {t(`form.colors.${color}`)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.color && (
              <p className="text-sm text-destructive">{form.formState.errors.color.message as string}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t("form.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
