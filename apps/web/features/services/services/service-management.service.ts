import {
  createService,
  updateService,
  updateServiceOrders,
  getServiceBySlug,
  getServiceByName,
  getServiceById,
} from '../repository'
import { ServiceFormData } from '../validations'

export class ServiceManagementError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServiceManagementError'
  }
}

export async function createNewService(
  organizationId: string,
  data: ServiceFormData
) {
  // Check for unique name
  const existingName = await getServiceByName(organizationId, data.name)
  if (existingName) {
    throw new ServiceManagementError(
      'A service with this name already exists in your organization.'
    )
  }

  // Check for unique slug
  const existingSlug = await getServiceBySlug(organizationId, data.slug)
  if (existingSlug) {
    throw new ServiceManagementError(
      'A service with this URL slug already exists.'
    )
  }

  return await createService({
    organizationId,
    categoryId: data.categoryId || null,
    name: data.name,
    slug: data.slug,
    description: data.description,
    durationMinutes: data.durationMinutes,
    price: data.price,
    color: data.color || null,
    isActive: data.isActive,
    bufferBeforeMinutes: data.bufferBeforeMinutes,
    bufferAfterMinutes: data.bufferAfterMinutes,
  })
}

export async function updateExistingService(
  organizationId: string,
  serviceId: string,
  data: ServiceFormData
) {
  const existingService = await getServiceById(serviceId)
  if (!existingService || existingService.organizationId !== organizationId) {
    throw new ServiceManagementError('Service not found or access denied.')
  }

  // If name changed, check uniqueness
  if (existingService.name !== data.name) {
    const existingName = await getServiceByName(organizationId, data.name)
    if (existingName) {
      throw new ServiceManagementError(
        'A service with this name already exists in your organization.'
      )
    }
  }

  // If slug changed, check uniqueness
  if (existingService.slug !== data.slug) {
    const existingSlug = await getServiceBySlug(organizationId, data.slug)
    if (existingSlug) {
      throw new ServiceManagementError(
        'A service with this URL slug already exists.'
      )
    }
  }

  return await updateService(serviceId, {
    categoryId: data.categoryId || null,
    name: data.name,
    slug: data.slug,
    description: data.description,
    durationMinutes: data.durationMinutes,
    price: data.price,
    color: data.color || null,
    isActive: data.isActive,
    bufferBeforeMinutes: data.bufferBeforeMinutes,
    bufferAfterMinutes: data.bufferAfterMinutes,
  })
}

export async function toggleServiceStatus(
  organizationId: string,
  serviceId: string,
  isActive: boolean
) {
  const existingService = await getServiceById(serviceId)
  if (!existingService || existingService.organizationId !== organizationId) {
    throw new ServiceManagementError('Service not found or access denied.')
  }

  return await updateService(serviceId, { isActive })
}

export async function reorderServices(
  organizationId: string,
  orderedIds: string[]
) {
  await updateServiceOrders(organizationId, orderedIds)
}
