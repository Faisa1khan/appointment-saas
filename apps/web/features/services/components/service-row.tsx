"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Edit2, Archive, RotateCcw } from "lucide-react"

import { type Service } from "../types"

interface ServiceRowProps {
  service: Service
  onEdit: (service: Service) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst: boolean
  isLast: boolean
}

export function ServiceRow({
  service,
  onEdit,
  onArchive,
  onRestore,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: ServiceRowProps) {
  const t = useTranslations("services")

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 group">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {service.color && (
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: `var(--${service.color}-500, ${service.color})` }}
            />
          )}
          <span className="font-medium">{service.name}</span>
          {!service.isActive && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
              {t("status.archived")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{service.durationMinutes} min</span>
          <span>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: service.currency || 'USD'
            }).format((service.price || 0) / 100)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <div className="flex flex-col mr-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-6 h-6" 
            disabled={isFirst}
            onClick={onMoveUp}
            aria-label={t("actions.moveUp")}
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-6 h-6" 
            disabled={isLast}
            onClick={onMoveDown}
            aria-label={t("actions.moveDown")}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(service)}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          {t("actions.edit")}
        </Button>

        {service.isActive ? (
          <Button 
            variant="outline" 
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onArchive(service.id)}
          >
            <Archive className="w-4 h-4 mr-2" />
            {t("actions.archive")}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onRestore(service.id)}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("actions.restore")}
          </Button>
        )}
      </div>
    </div>
  )
}
