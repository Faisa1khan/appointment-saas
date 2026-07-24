"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Edit2, Archive, RotateCcw, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { type Service } from "../repository"

interface ServiceRowProps {
  service: Service
  currency: string
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
  currency,
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
    <div className="flex items-start sm:items-center justify-between p-4 border-b last:border-b-0 gap-4">
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {service.color && (
            <div 
              className="w-3 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: `var(--${service.color}-500, ${service.color})` }}
            />
          )}
          <span className="font-medium truncate">{service.name}</span>
          {!service.isActive && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground shrink-0">
              {t("status.archived")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{service.durationMinutes} min</span>
          <span>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency || 'USD'
            }).format((service.price || 0) / 100)}
          </span>
        </div>
      </div>

      <div className="flex items-center shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 rounded-full" aria-label={t("actions.more") || "More options"} />
          }>
            <MoreVertical className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(service)}>
              <Edit2 className="w-4 h-4 mr-2" />
              {t("actions.edit")}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />

            {!isFirst && onMoveUp && (
              <DropdownMenuItem onClick={onMoveUp}>
                <ArrowUp className="w-4 h-4 mr-2" />
                {t("actions.moveUp")}
              </DropdownMenuItem>
            )}
            {!isLast && onMoveDown && (
              <DropdownMenuItem onClick={onMoveDown}>
                <ArrowDown className="w-4 h-4 mr-2" />
                {t("actions.moveDown")}
              </DropdownMenuItem>
            )}

            {(onMoveUp || onMoveDown) && (!isFirst || !isLast) && <DropdownMenuSeparator />}

            {service.isActive ? (
              <DropdownMenuItem 
                onClick={() => onArchive(service.id)}
                className="text-destructive focus:text-destructive"
              >
                <Archive className="w-4 h-4 mr-2" />
                {t("actions.archive")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onRestore(service.id)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("actions.restore")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
