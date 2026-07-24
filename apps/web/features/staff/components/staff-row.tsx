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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { type Staff } from "../repository"

interface StaffRowProps {
  staff: Staff
  onEdit: (staff: Staff) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst: boolean
  isLast: boolean
}

export function StaffRow({
  staff,
  onEdit,
  onArchive,
  onRestore,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: StaffRowProps) {
  const t = useTranslations("staff")

  return (
    <div className="flex items-start sm:items-center justify-between p-4 border-b last:border-b-0 gap-4">
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <Avatar className="h-8 w-8">
            {staff.avatarUrl && <AvatarImage src={staff.avatarUrl} alt={staff.name} />}
            <AvatarFallback 
              className="text-xs text-white"
              style={{ backgroundColor: staff.color ? `var(--${staff.color}-500, ${staff.color})` : 'var(--primary)' }}
            >
              {staff.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium truncate">{staff.name}</span>
          {!staff.isActive && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground shrink-0">
              {t("status.archived")}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 rounded-full" aria-label={t("actions.more")} />
          }>
            <MoreVertical className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(staff)}>
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

            {staff.isActive ? (
              <DropdownMenuItem 
                onClick={() => onArchive(staff.id)}
                className="text-destructive focus:text-destructive"
              >
                <Archive className="w-4 h-4 mr-2" />
                {t("actions.archive")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onRestore(staff.id)}>
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
