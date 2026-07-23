"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface EmptyStateProps {
  onAdd: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  const t = useTranslations("services")

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20 border-dashed min-h-[300px]">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
        <PlusCircle className="w-6 h-6 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{t("empty.title")}</h3>
      <p className="max-w-sm mb-6 text-sm text-muted-foreground">
        {t("empty.description")}
      </p>
      <Button onClick={onAdd}>
        <PlusCircle className="w-4 h-4 mr-2" />
        {t("addService")}
      </Button>
    </div>
  )
}
