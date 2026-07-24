"use client"

import { useTranslations } from "next-intl"
import { type Staff } from "../repository"
import { StaffRow } from "./staff-row"

interface StaffListProps {
  staffList: Staff[]
  onEdit: (staff: Staff) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onMoveUp?: (index: number) => void
  onMoveDown?: (index: number) => void
}

export function StaffList({ 
  staffList, 
  onEdit, 
  onArchive, 
  onRestore, 
  onMoveUp, 
  onMoveDown 
}: StaffListProps) {
  const t = useTranslations("staff")

  if (staffList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20 border-dashed min-h-[300px]">
        <p className="text-sm text-muted-foreground">
          No staff members found in this view.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="flex flex-col">
        {staffList.map((staff, index) => (
          <StaffRow
            key={staff.id}
            staff={staff}
            onEdit={onEdit}
            onArchive={onArchive}
            onRestore={onRestore}
            onMoveUp={onMoveUp ? () => onMoveUp(index) : undefined}
            onMoveDown={onMoveDown ? () => onMoveDown(index) : undefined}
            isFirst={index === 0}
            isLast={index === staffList.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
