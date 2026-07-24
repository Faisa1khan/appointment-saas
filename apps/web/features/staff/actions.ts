'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentOrganizationId } from '@/lib/auth/auth.service'
import { StaffSchema, UpdateStaffOrderSchema, type StaffFormData } from './validations'
import {
  createNewStaffMember,
  updateExistingStaffMember,
  toggleStaffStatus,
  reorderStaffMembers
} from './services/staff-management.service'
import { getStaffById } from './repository'

export async function createStaffAction(data: StaffFormData) {
  try {
    const orgId = await getCurrentOrganizationId()
    if (!orgId) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = StaffSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: 'Invalid data' }
    }

    const result = await createNewStaffMember(orgId, {
      ...validated.data,
      color: validated.data.color || null,
      avatarUrl: validated.data.avatarUrl || null
    })

    if (result.success) {
      revalidatePath('/app/staff')
    }

    return result
  } catch (error) {
    console.error('Create staff error:', error)
    return { success: false, error: 'Failed to create staff member' }
  }
}

export async function updateStaffAction(id: string, data: StaffFormData) {
  try {
    const orgId = await getCurrentOrganizationId()
    if (!orgId) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = StaffSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: 'Invalid data' }
    }

    const existing = await getStaffById(id, orgId)
    if (!existing) {
      return { success: false, error: 'Staff member not found' }
    }

    const result = await updateExistingStaffMember(id, orgId, {
      ...validated.data,
      color: validated.data.color || null,
      avatarUrl: validated.data.avatarUrl || null
    })

    if (result.success) {
      revalidatePath('/app/staff')
    }

    return result
  } catch (error) {
    console.error('Update staff error:', error)
    return { success: false, error: 'Failed to update staff member' }
  }
}

export async function toggleStaffStatusAction(id: string, isActive: boolean) {
  try {
    const orgId = await getCurrentOrganizationId()
    if (!orgId) {
      return { success: false, error: 'Unauthorized' }
    }

    const result = await toggleStaffStatus(id, orgId, isActive)

    if (result.success) {
      revalidatePath('/app/staff')
    }

    return result
  } catch (error) {
    console.error('Toggle staff status error:', error)
    return { success: false, error: 'Failed to update status' }
  }
}

export async function reorderStaffAction(orderedIds: string[]) {
  try {
    const orgId = await getCurrentOrganizationId()
    if (!orgId) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = UpdateStaffOrderSchema.safeParse(orderedIds)
    if (!validated.success) {
      return { success: false, error: 'Invalid data' }
    }

    const result = await reorderStaffMembers(validated.data, orgId)

    if (result.success) {
      revalidatePath('/app/staff')
    }

    return result
  } catch (error) {
    console.error('Reorder staff error:', error)
    return { success: false, error: 'Failed to reorder staff members' }
  }
}
