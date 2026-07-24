"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { ServiceSchema, type ServiceFormData } from "../validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { slugify } from "@/lib/slug"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTransition } from "react"
import { createServiceAction, updateServiceAction } from "../actions"
import { toast } from "sonner"
import { type Service } from "../repository"

interface Category {
  id: string
  name: string
}

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
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      name: service?.name || "",
      slug: service?.slug || "",
      description: service?.description || "",
      durationMinutes: service?.durationMinutes || 30,
      price: service ? service.price / 100 : 0, // Convert minor units to display
      color: (service?.color as ServiceFormData['color']) || "blue",
      categoryId: service?.categoryId || null,
      isActive: service?.isActive ?? true,
      bufferBeforeMinutes: service?.bufferBeforeMinutes || 0,
      bufferAfterMinutes: service?.bufferAfterMinutes || 0,
    },
  })

  function onSubmit(data: ServiceFormData) {
    startTransition(async () => {
      // Convert display price back to minor units
      const submissionData = {
        ...data,
        price: Math.round(data.price * 100),
        categoryId: data.categoryId === "none" ? null : data.categoryId
      }

      if (service) {
        const result = await updateServiceAction(service.id, submissionData)
        if (result.success) {
          toast.success(t("messages.updated"))
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(result.error || t("messages.error"))
        }
      } else {
        const result = await createServiceAction(submissionData)
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

  // Auto-generate slug from name if user hasn't typed in slug manually
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setValue("name", name)
    // Only auto-generate if we are creating a new service
    if (!service) {
      const generatedSlug = slugify(name)
      form.setValue("slug", generatedSlug, { shouldValidate: true })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? t("form.editTitle") : t("form.createTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input id="name" placeholder={t("form.namePlaceholder")} {...form.register("name")} onChange={handleNameChange} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input id="slug" placeholder="e.g. haircut" {...form.register("slug")} />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive">{form.formState.errors.slug.message as string}</p>
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
              <Label htmlFor="durationMinutes">{t("form.duration")} (min)</Label>
              <Input 
                id="durationMinutes"
                type="number" 
                step="5"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bufferBeforeMinutes">Buffer Before (min)</Label>
              <Input 
                id="bufferBeforeMinutes"
                type="number" 
                step="5"
                {...form.register("bufferBeforeMinutes", { valueAsNumber: true })}
              />
              {form.formState.errors.bufferBeforeMinutes && (
                <p className="text-sm text-destructive">{form.formState.errors.bufferBeforeMinutes.message as string}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bufferAfterMinutes">Buffer After (min)</Label>
              <Input 
                id="bufferAfterMinutes"
                type="number" 
                step="5"
                {...form.register("bufferAfterMinutes", { valueAsNumber: true })}
              />
              {form.formState.errors.bufferAfterMinutes && (
                <p className="text-sm text-destructive">{form.formState.errors.bufferAfterMinutes.message as string}</p>
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

          {categories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="is-active"
                />
              )}
            />
            <Label htmlFor="is-active">Active (Bookable by customers)</Label>
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
