"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { type Category, type Service } from "../repository"
import { CategoryRow } from "./category-row"
import { EmptyState } from "./empty-state"
import { reorderCategoriesAction, deleteCategoryAction } from "../actions"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CategoryListProps {
  categories: Category[]
  services: Service[]
  onEdit: (category: Category) => void
}

export function CategoryList({ categories: initialCategories, services, onEdit }: CategoryListProps) {
  const t = useTranslations("services")
  const [categories, setCategories] = useState(initialCategories)
  const [isPending, startTransition] = useTransition()
  
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [servicesAffectedCount, setServicesAffectedCount] = useState(0)

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === categories.length - 1)
    ) return

    const newCategories = [...categories]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    const temp = newCategories[index]
    newCategories[index] = newCategories[swapIndex]
    newCategories[swapIndex] = temp

    setCategories(newCategories)

    startTransition(async () => {
      const result = await reorderCategoriesAction(newCategories.map(c => c.id))
      if (!result.success) {
        setCategories(categories) // Revert on failure
        toast.error("Failed to reorder categories")
      }
    })
  }

  const handleDeleteRequest = (category: Category) => {
    const count = services.filter(s => s.categoryId === category.id).length
    setServicesAffectedCount(count)
    setCategoryToDelete(category)
  }

  const confirmDelete = () => {
    if (!categoryToDelete) return
    const id = categoryToDelete.id
    
    // Optimistic UI update
    const previous = [...categories]
    setCategories(categories.filter(c => c.id !== id))
    setCategoryToDelete(null)

    startTransition(async () => {
      const result = await deleteCategoryAction(id)
      if (result.success) {
        toast.success("Category deleted")
      } else {
        setCategories(previous)
        toast.error(result.error || "Failed to delete category")
      }
    })
  }

  if (categories.length === 0) {
    return (
      <EmptyState 
        title="No categories yet" 
        description="Create categories to organize your services."
        icon="folder"
      />
    )
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="flex flex-col">
        {categories.map((category, index) => (
          <CategoryRow
            key={category.id}
            category={category}
            serviceCount={services.filter(s => s.categoryId === category.id).length}
            onEdit={onEdit}
            onDelete={handleDeleteRequest}
            onMoveUp={() => handleMove(index, 'up')}
            onMoveDown={() => handleMove(index, 'down')}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
          />
        ))}
      </div>

      <AlertDialog open={!!categoryToDelete} onOpenChange={(open: boolean) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the <strong>{categoryToDelete?.name}</strong> category.
              <br/><br/>
              {servicesAffectedCount > 0 && (
                <span className="text-destructive font-medium">
                  Deleting this category will remove it from {servicesAffectedCount} {servicesAffectedCount === 1 ? 'service' : 'services'}. The {servicesAffectedCount === 1 ? 'service' : 'services'} will not be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
