"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { EmptyState } from "./empty-state"
import { ServiceList } from "./service-list"
import { ServiceForm } from "./service-form"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { archiveService, reorderServices } from "../actions/service.actions"
import { toast } from "sonner"

import { type Service, type Category } from "../types"

interface ServicesViewProps {
  services: Service[]
  categories: Category[]
}

export function ServicesView({ services: initialServices, categories }: ServicesViewProps) {
  const t = useTranslations("services")
  const [isPending, startTransition] = useTransition()
  
  // We use optimistic state for the list to make reordering and archiving feel instant
  const [services, setServices] = useState(initialServices)

  const activeServices = services.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
  const archivedServices = services.filter(s => !s.isActive).sort((a, b) => a.displayOrder - b.displayOrder)

  const handleArchive = async (id: string) => {
    const previous = [...services]
    setServices(services.map(s => s.id === id ? { ...s, isActive: false } : s))
    
    const result = await archiveService(id, true)
    if (!result.success) {
      setServices(previous)
      toast.error(t("messages.error"))
    } else {
      toast.success(t("messages.archived"))
    }
  }

  const handleRestore = async (id: string) => {
    const previous = [...services]
    setServices(services.map(s => s.id === id ? { ...s, isActive: true } : s))
    
    const result = await archiveService(id, false)
    if (!result.success) {
      setServices(previous)
      toast.error(t("messages.error"))
    } else {
      toast.success(t("messages.restored"))
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down', isArchivedList: boolean) => {
    const listToReorder = isArchivedList ? archivedServices : activeServices
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === listToReorder.length - 1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    // Create a copy and swap the visual order
    const newList = [...listToReorder]
    const temp = newList[index]
    newList[index] = newList[newIndex]
    newList[newIndex] = temp

    // Re-assign displayOrder sequentially
    const updatedItems = newList.map((item, i) => ({ ...item, displayOrder: i }))

    // Update main state optimistically
    const previous = [...services]
    setServices(services.map(s => {
      const updated = updatedItems.find(u => u.id === s.id)
      return updated ? updated : s
    }))

    const result = await reorderServices(updatedItems.map(item => ({ id: item.id, displayOrder: item.displayOrder })))
    if (!result.success) {
      setServices(previous)
      toast.error(t("messages.error"))
    }
  }

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingService(null)
    setIsFormOpen(true)
  }

  // Handle successful form submission by refreshing the data (simple MVP approach)
  // In a real app with React 19 we might use useOptimistic or router.refresh()
  const handleFormSuccess = () => {
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {services.length > 0 && (
            <Button onClick={handleCreate}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {t("addService")}
            </Button>
          )}
        </div>
      </div>

      {services.length === 0 ? (
        <EmptyState onAdd={handleCreate} />
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">{t("tabs.active")} ({activeServices.length})</TabsTrigger>
            <TabsTrigger value="archived">{t("tabs.archived")} ({archivedServices.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-0">
            <ServiceList 
              services={activeServices} 
              onEdit={handleEdit}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onMoveUp={(idx) => handleMove(idx, 'up', false)}
              onMoveDown={(idx) => handleMove(idx, 'down', false)}
            />
          </TabsContent>
          
          <TabsContent value="archived" className="mt-0">
            <ServiceList 
              services={archivedServices} 
              onEdit={handleEdit}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onMoveUp={(idx) => handleMove(idx, 'up', true)}
              onMoveDown={(idx) => handleMove(idx, 'down', true)}
            />
          </TabsContent>
        </Tabs>
      )}

      <ServiceForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        service={editingService} 
        categories={categories}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
