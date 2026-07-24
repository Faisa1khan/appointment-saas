"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, Folder } from "lucide-react"
import { useTranslations } from "next-intl"

interface EmptyStateProps {
  onAdd?: () => void
  title?: string
  description?: string
  icon?: "plus" | "folder"
  buttonText?: string
}

export function EmptyState({ onAdd, title, description, icon = "plus", buttonText }: EmptyStateProps) {
  const t = useTranslations("services")
  const Icon = icon === "folder" ? Folder : PlusCircle

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20 border-dashed min-h-[300px]">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title || t("empty.title")}</h3>
      <p className="max-w-sm mb-6 text-sm text-muted-foreground">
        {description || t("empty.description")}
      </p>
      {onAdd && (
        <Button onClick={onAdd}>
          <PlusCircle className="w-4 h-4 mr-2" />
          {buttonText || t("addService")}
        </Button>
      )}
    </div>
  )
}
