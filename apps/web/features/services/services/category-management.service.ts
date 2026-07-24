import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryByName,
  getCategoryBySlug,
  getCategoryById,
  updateCategoryOrders,
  type CategoryInsert,
  type CategoryUpdate,
} from '../repository'

export class CategoryManagementError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CategoryManagementError'
  }
}

export async function createNewCategory(
  organizationId: string,
  data: Omit<CategoryInsert, 'organizationId' | 'id' | 'createdAt' | 'updatedAt'>
) {
  const existingName = await getCategoryByName(organizationId, data.name)
  if (existingName) {
    throw new CategoryManagementError('Category with this name already exists.')
  }

  const existingSlug = await getCategoryBySlug(organizationId, data.slug)
  if (existingSlug) {
    throw new CategoryManagementError('Category with this slug already exists.')
  }

  return await createCategory({
    ...data,
    organizationId,
  })
}

export async function updateExistingCategory(
  organizationId: string,
  categoryId: string,
  data: CategoryUpdate
) {
  const existingCategory = await getCategoryById(categoryId)
  if (!existingCategory) {
    throw new CategoryManagementError('Category not found.')
  }

  if (existingCategory.organizationId !== organizationId) {
    throw new CategoryManagementError('Unauthorized to update this category.')
  }

  if (data.name && data.name !== existingCategory.name) {
    const existingName = await getCategoryByName(organizationId, data.name)
    if (existingName) {
      throw new CategoryManagementError('Category with this name already exists.')
    }
  }

  if (data.slug && data.slug !== existingCategory.slug) {
    const existingSlug = await getCategoryBySlug(organizationId, data.slug)
    if (existingSlug) {
      throw new CategoryManagementError('Category with this slug already exists.')
    }
  }

  return await updateCategory(categoryId, data)
}

export async function deleteExistingCategory(
  organizationId: string,
  categoryId: string
) {
  const existingCategory = await getCategoryById(categoryId)
  if (!existingCategory) {
    throw new CategoryManagementError('Category not found.')
  }

  if (existingCategory.organizationId !== organizationId) {
    throw new CategoryManagementError('Unauthorized to delete this category.')
  }

  return await deleteCategory(categoryId, organizationId)
}

export async function reorderCategories(
  organizationId: string,
  orderedIds: string[]
) {
  await updateCategoryOrders(organizationId, orderedIds)
}
