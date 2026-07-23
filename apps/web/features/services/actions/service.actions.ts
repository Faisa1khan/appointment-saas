"use server"

import { db } from "@/lib/db"
import { services, serviceCategories } from "@/lib/db/schema"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { eq, and, inArray } from "drizzle-orm"
import { createClient } from "@/lib/supabase/server"
import { serviceSchema, serviceCategorySchema, serviceOrderSchema } from "../schemas/service.schema"
import { z } from "zod"

async function getOrganizationContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const appUser = await ensureAppUser(user)
  const member = await db.query.organizationMembers.findFirst({
    where: (members, { eq }) => eq(members.userId, appUser.id)
  })

  if (!member) throw new Error("No organization found")
  return member.organizationId
}

export async function createService(data: z.infer<typeof serviceSchema>) {
  try {
    const orgId = await getOrganizationContext()
    const validated = serviceSchema.parse(data)

    const [newService] = await db.insert(services).values({
      organizationId: orgId,
      ...validated,
    }).returning()

    return { success: true, service: newService }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, fieldErrors: error.flatten().fieldErrors }
    return { success: false, error: "Failed to create service" }
  }
}

export async function updateService(id: string, data: z.infer<typeof serviceSchema>) {
  try {
    const orgId = await getOrganizationContext()
    const validated = serviceSchema.parse(data)

    const [updated] = await db.update(services).set({
      ...validated,
      updatedAt: new Date()
    })
    .where(and(eq(services.id, id), eq(services.organizationId, orgId)))
    .returning()

    if (!updated) return { success: false, error: "Service not found or unauthorized" }
    return { success: true, service: updated }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, fieldErrors: error.flatten().fieldErrors }
    return { success: false, error: "Failed to update service" }
  }
}

export async function archiveService(id: string, archive: boolean = true) {
  try {
    const orgId = await getOrganizationContext()
    const [updated] = await db.update(services)
      .set({ isActive: !archive, updatedAt: new Date() })
      .where(and(eq(services.id, id), eq(services.organizationId, orgId)))
      .returning()
      
    if (!updated) return { success: false, error: "Service not found or unauthorized" }
    return { success: true, service: updated }
  } catch (error) {
    return { success: false, error: "Failed to archive/restore service" }
  }
}

export async function reorderServices(items: z.infer<typeof serviceOrderSchema>) {
  try {
    const orgId = await getOrganizationContext()
    const validated = serviceOrderSchema.parse(items)

    await db.transaction(async (tx) => {
      for (const item of validated) {
        await tx.update(services)
          .set({ displayOrder: item.displayOrder })
          .where(and(eq(services.id, item.id), eq(services.organizationId, orgId)))
      }
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to reorder services" }
  }
}

// Category Actions
export async function createCategory(data: z.infer<typeof serviceCategorySchema>) {
  try {
    const orgId = await getOrganizationContext()
    const validated = serviceCategorySchema.parse(data)

    const [newCategory] = await db.insert(serviceCategories).values({
      organizationId: orgId,
      ...validated,
    }).returning()

    return { success: true, category: newCategory }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, fieldErrors: error.flatten().fieldErrors }
    return { success: false, error: "Failed to create category" }
  }
}

export async function updateCategory(id: string, data: z.infer<typeof serviceCategorySchema>) {
  try {
    const orgId = await getOrganizationContext()
    const validated = serviceCategorySchema.parse(data)

    const [updated] = await db.update(serviceCategories).set({
      ...validated,
      updatedAt: new Date()
    })
    .where(and(eq(serviceCategories.id, id), eq(serviceCategories.organizationId, orgId)))
    .returning()

    if (!updated) return { success: false, error: "Category not found or unauthorized" }
    return { success: true, category: updated }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, fieldErrors: error.flatten().fieldErrors }
    return { success: false, error: "Failed to update category" }
  }
}
