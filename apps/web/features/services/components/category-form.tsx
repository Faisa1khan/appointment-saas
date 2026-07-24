"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { CategorySchema, type CategoryFormData } from "../validations"
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
import { createCategoryAction, updateCategoryAction } from "../actions"
import { toast } from "sonner"
import { type Category } from "../repository"
import { slugify } from "@/lib/slug"

interface CategoryFormProps {
  category?: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CategoryForm({ category, open, onOpenChange, onSuccess }: CategoryFormProps) {
  const t = useTranslations("services") // Reusing services translations for now
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      color: (category?.color as CategoryFormData['color']) || "blue",
    },
  })

  function onSubmit(data: CategoryFormData) {
    startTransition(async () => {
      if (category) {
        const result = await updateCategoryAction(category.id, data)
        if (result.success) {
          toast.success("Category updated successfully")
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(result.error || t("messages.error"))
        }
      } else {
        const result = await createCategoryAction(data)
        if (result.success) {
          toast.success("Category created successfully")
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
    // Only auto-generate if we are creating a new category
    if (!category) {
      const generatedSlug = slugify(name)
      form.setValue("slug", generatedSlug, { shouldValidate: true })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Create Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input id="name" placeholder="e.g. Haircuts" {...form.register("name")} onChange={handleNameChange} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input id="slug" placeholder="e.g. haircuts" {...form.register("slug")} />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive">{form.formState.errors.slug.message as string}</p>
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
