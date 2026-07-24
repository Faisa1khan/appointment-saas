"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { StaffSchema, type StaffFormData } from "../validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTransition } from "react"
import { createStaffAction, updateStaffAction } from "../actions"
import { toast } from "sonner"
import { type Staff } from "../repository"

interface StaffFormProps {
  staff?: Staff | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function StaffForm({ staff, open, onOpenChange, onSuccess }: StaffFormProps) {
  const t = useTranslations("staff")
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    resolver: zodResolver(StaffSchema),
    defaultValues: {
      name: staff?.name || "",
      color: (staff?.color as StaffFormData['color']) || "blue",
      avatarUrl: staff?.avatarUrl || "",
    },
  })

  function onSubmit(data: StaffFormData) {
    startTransition(async () => {
      if (staff) {
        const result = await updateStaffAction(staff.id, data)
        if (result.success) {
          toast.success(t("messages.updated"))
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(result.error || t("messages.error"))
        }
      } else {
        const result = await createStaffAction(data)
        if (result.success) {
          toast.success(t("messages.created"))
          onSuccess()
          onOpenChange(false)
          form.reset()
        } else {
          toast.error(result.error || t("messages.error"))
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staff ? t("form.editTitle") : t("form.createTitle")}</DialogTitle>
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
            <Label htmlFor="avatarUrl">{t("form.avatarUrl")}</Label>
            <Input id="avatarUrl" placeholder={t("form.avatarUrlPlaceholder")} {...form.register("avatarUrl")} />
            {form.formState.errors.avatarUrl && (
              <p className="text-sm text-destructive">{form.formState.errors.avatarUrl.message as string}</p>
            )}
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

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? t("form.saving") : t("form.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
