"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

import { type Staff } from "../repository"
import { StaffList } from "./staff-list"
import { StaffForm } from "./staff-form"
import { toggleStaffStatusAction, reorderStaffAction } from "../actions"

interface StaffViewProps {
  staffMembers: Staff[]
}

export function StaffView({ staffMembers: initialStaff }: StaffViewProps) {
  const t = useTranslations("staff")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [staff, setStaff] = useState(initialStaff)

  const activeStaff = staff.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
  const archivedStaff = staff.filter(s => !s.isActive).sort((a, b) => a.displayOrder - b.displayOrder)

  const handleArchive = async (id: string) => {
    const previous = [...staff]
    setStaff(staff.map(s => s.id === id ? { ...s, isActive: false } : s))
    
    const result = await toggleStaffStatusAction(id, false)
    if (!result.success) {
      setStaff(previous)
      toast.error(t("messages.error"))
    } else {
      toast.success(t("messages.archived"))
    }
  }

  const handleRestore = async (id: string) => {
    const previous = [...staff]
    setStaff(staff.map(s => s.id === id ? { ...s, isActive: true } : s))
    
    const result = await toggleStaffStatusAction(id, true)
    if (!result.success) {
      setStaff(previous)
      toast.error(t("messages.error"))
    } else {
      toast.success(t("messages.restored"))
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down', isArchivedList: boolean) => {
    const listToReorder = isArchivedList ? archivedStaff : activeStaff
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === listToReorder.length - 1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    // Swap
    const newList = [...listToReorder]
    const temp = newList[index]
    newList[index] = newList[newIndex]
    newList[newIndex] = temp

    // Re-assign displayOrder
    const updatedItems = newList.map((item, i) => ({ ...item, displayOrder: i }))

    // Optimistic state
    const previous = [...staff]
    setStaff(staff.map(s => {
      const updated = updatedItems.find(u => u.id === s.id)
      return updated ? updated : s
    }))

    const result = await reorderStaffAction(updatedItems.map(item => item.id))
    if (!result.success) {
      setStaff(previous)
      toast.error(t("messages.error"))
    }
  }

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingStaff(null)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {staff.length > 0 && (
            <Button onClick={handleCreate}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {t("addStaff")}
            </Button>
          )}
        </div>
      </div>

      {staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20 border-dashed min-h-[300px]">
          <h3 className="mb-2 text-lg font-semibold">{t("empty.title")}</h3>
          <p className="max-w-sm mb-6 text-sm text-muted-foreground">
            {t("empty.description")}
          </p>
          <Button onClick={handleCreate}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {t("addStaff")}
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">{t("tabs.active")} ({activeStaff.length})</TabsTrigger>
            <TabsTrigger value="archived">{t("tabs.archived")} ({archivedStaff.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-0">
            <StaffList 
              staffList={activeStaff} 
              onEdit={handleEdit}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onMoveUp={(idx) => handleMove(idx, 'up', false)}
              onMoveDown={(idx) => handleMove(idx, 'down', false)}
            />
          </TabsContent>
          
          <TabsContent value="archived" className="mt-0">
            <StaffList 
              staffList={archivedStaff} 
              onEdit={handleEdit}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onMoveUp={(idx) => handleMove(idx, 'up', true)}
              onMoveDown={(idx) => handleMove(idx, 'down', true)}
            />
          </TabsContent>
        </Tabs>
      )}

      <StaffForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        staff={editingStaff} 
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
