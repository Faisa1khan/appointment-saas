"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Edit2, Trash2, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { type Category } from "../repository"

interface CategoryRowProps {
  category: Category
  serviceCount: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst: boolean
  isLast: boolean
}

export function CategoryRow({
  category,
  serviceCount,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: CategoryRowProps) {
  const t = useTranslations("services") // Reusing services namespace

  return (
    <div className="flex items-start sm:items-center justify-between p-4 border-b last:border-b-0 gap-4">
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {category.color && (
            <div 
              className="w-3 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: `var(--${category.color}-500, ${category.color})` }}
            />
          )}
          <span className="font-medium truncate">{category.name}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{serviceCount} {serviceCount === 1 ? 'service' : 'services'}</span>
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
            <DropdownMenuItem onClick={() => onEdit(category)}>
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

            <DropdownMenuItem 
              onClick={() => onDelete(category)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
