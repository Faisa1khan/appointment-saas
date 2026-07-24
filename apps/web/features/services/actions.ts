'use server'

import { revalidatePath } from 'next/cache'
import { ensureAppUser } from '@/lib/auth/ensure-app-user'
import {
  createNewService,
  updateExistingService,
  toggleServiceStatus,
  reorderServices,
  ServiceManagementError,
} from './services/service-management.service'
import {
  createNewCategory,
  updateExistingCategory,
  deleteExistingCategory,
  reorderCategories,
  CategoryManagementError,
} from './services/category-management.service'
import { ServiceSchema, UpdateServiceOrderSchema, CategorySchema, UpdateCategoryOrderSchema } from './validations'
import { getCurrentOrganizationId, AuthError } from '@/lib/auth/auth.service'

export async function createServiceAction(formData: unknown) {
  try {
    const organizationId = await getCurrentOrganizationId()
    const data = ServiceSchema.parse(formData)

    const service = await createNewService(organizationId, data)
    
    revalidatePath('/app/services')
    return { success: true, data: service }
  } catch (error) {
    if (error instanceof ServiceManagementError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create service' }
  }
}

export async function updateServiceAction(serviceId: string, formData: unknown) {
  try {
    const organizationId = await getCurrentOrganizationId()
    const data = ServiceSchema.parse(formData)

    const service = await updateExistingService(
      organizationId,
      serviceId,
      data
    )
    
    revalidatePath('/app/services')
    return { success: true, data: service }
  } catch (error) {
    if (error instanceof ServiceManagementError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update service' }
  }
}

export async function toggleServiceStatusAction(
  serviceId: string,
  isActive: boolean
) {
  try {
    const organizationId = await getCurrentOrganizationId()
    await toggleServiceStatus(organizationId, serviceId, isActive)
    
    revalidatePath('/app/services')
    return { success: true }
  } catch (error) {
    if (error instanceof ServiceManagementError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update service status' }
  }
}

export async function reorderServicesAction(orderedIds: string[]) {
  try {
    const organizationId = await getCurrentOrganizationId()
    const validIds = UpdateServiceOrderSchema.parse(orderedIds)
    
    await reorderServices(organizationId, validIds)
    
    revalidatePath('/app/services')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ==========================================
// Category Actions
// ==========================================

export async function createCategoryAction(formData: unknown) {
  try {
    const organizationId = await getCurrentOrganizationId()
    const data = CategorySchema.parse(formData)

    const category = await createNewCategory(organizationId, data)
    
    revalidatePath('/app/services')
    return { success: true, category }
  } catch (error) {
    if (error instanceof CategoryManagementError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

export async function updateCategoryAction(categoryId: string, formData: unknown) {
  try {
    const organizationId = await getCurrentOrganizationId()
    const data = CategorySchema.parse(formData)

    const category = await updateExistingCategory(
      organizationId,
      categoryId,
      data
    )
    
    revalidatePath('/app/services')
    return { success: true, category }
  } catch (error) {
    if (error instanceof CategoryManagementError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    const organizationId = await getCurrentOrganizationId()
    await deleteExistingCategory(organizationId, categoryId)
    
    revalidatePath('/app/services')
    return { success: true }
  } catch (error) {
    if (error instanceof CategoryManagementError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  try {
    const organizationId = await getCurrentOrganizationId()
    const validIds = UpdateCategoryOrderSchema.parse(orderedIds)
    
    await reorderCategories(organizationId, validIds)
    
    revalidatePath('/app/services')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
