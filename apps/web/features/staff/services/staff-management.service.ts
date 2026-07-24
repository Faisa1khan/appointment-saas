import { slugify } from '@/lib/slug'
import {
  createStaff,
  updateStaff,
  updateStaffStatus,
  updateStaffOrder,
  getStaffBySlug,
  type Staff,
  type NewStaff
} from '../repository'

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Generates a unique slug for a staff member within an organization.
 * Since staff names don't need to be unique, we append a counter to the slug
 * if a conflict is found.
 */
async function generateUniqueSlug(organizationId: string, name: string, currentSlug?: string): Promise<string> {
  const baseSlug = slugify(name)
  let slug = baseSlug
  let counter = 1

  while (true) {
    // If we're updating and the generated slug matches current, it's safe
    if (currentSlug && slug === currentSlug) {
      return slug
    }

    const existing = await getStaffBySlug(slug, organizationId)
    if (!existing) {
      return slug
    }
    
    // Slug exists, append counter and try again
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export async function createNewStaffMember(
  organizationId: string,
  data: Omit<NewStaff, 'organizationId' | 'slug' | 'type'>
): Promise<ServiceResult<Staff>> {
  try {
    const slug = await generateUniqueSlug(organizationId, data.name)

    const staff = await createStaff({
      ...data,
      organizationId,
      slug
    })

    return { success: true, data: staff }
  } catch (error) {
    console.error('Failed to create staff member:', error)
    return { success: false, error: 'Failed to create staff member' }
  }
}

export async function updateExistingStaffMember(
  id: string,
  organizationId: string,
  data: Partial<Omit<NewStaff, 'organizationId' | 'slug' | 'type'>>
): Promise<ServiceResult<Staff>> {
  try {
    const updated = await updateStaff(id, organizationId, {
      ...data
    })

    if (!updated) {
      return { success: false, error: 'Staff member not found' }
    }

    return { success: true, data: updated }
  } catch (error) {
    console.error('Failed to update staff member:', error)
    return { success: false, error: 'Failed to update staff member' }
  }
}

export async function toggleStaffStatus(
  id: string,
  organizationId: string,
  isActive: boolean
): Promise<ServiceResult<Staff>> {
  try {
    const updated = await updateStaffStatus(id, organizationId, isActive)
    if (!updated) {
      return { success: false, error: 'Staff member not found' }
    }
    return { success: true, data: updated }
  } catch (error) {
    console.error('Failed to toggle staff status:', error)
    return { success: false, error: 'Failed to update staff status' }
  }
}

export async function reorderStaffMembers(
  orderedIds: string[],
  organizationId: string
): Promise<ServiceResult<void>> {
  try {
    const updates = orderedIds.map((id, index) => ({
      id,
      displayOrder: index
    }))

    await updateStaffOrder(updates, organizationId)
    return { success: true }
  } catch (error) {
    console.error('Failed to reorder staff members:', error)
    return { success: false, error: 'Failed to reorder staff members' }
  }
}
