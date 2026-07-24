import { db } from '@/lib/db'
import { services, serviceCategories } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export type ServiceInsert = typeof services.$inferInsert
export type ServiceUpdate = Partial<typeof services.$inferInsert>
export type Service = typeof services.$inferSelect

export type CategoryInsert = typeof serviceCategories.$inferInsert
export type CategoryUpdate = Partial<typeof serviceCategories.$inferInsert>
export type Category = typeof serviceCategories.$inferSelect

export async function getServicesByOrgId(organizationId: string) {
  return await db.query.services.findMany({
    where: eq(services.organizationId, organizationId),
    orderBy: [asc(services.displayOrder), asc(services.createdAt)],
  })
}

export async function getServiceById(id: string) {
  return await db.query.services.findFirst({
    where: eq(services.id, id),
  })
}

export async function getServiceBySlug(organizationId: string, slug: string) {
  return await db.query.services.findFirst({
    where: and(
      eq(services.organizationId, organizationId),
      eq(services.slug, slug)
    ),
  })
}

export async function getServiceByName(organizationId: string, name: string) {
  return await db.query.services.findFirst({
    where: and(
      eq(services.organizationId, organizationId),
      eq(services.name, name)
    ),
  })
}

export async function createService(data: ServiceInsert) {
  const [newService] = await db.insert(services).values(data).returning()
  return newService
}

export async function updateService(id: string, data: ServiceUpdate) {
  const [updatedService] = await db
    .update(services)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(services.id, id))
    .returning()
  return updatedService
}

export async function updateServiceOrders(
  organizationId: string,
  orderedIds: string[]
) {
  return await db.transaction(async (tx) => {
    const promises = orderedIds.map((id, index) =>
      tx
        .update(services)
        .set({ displayOrder: index, updatedAt: new Date() })
        .where(
          and(eq(services.id, id), eq(services.organizationId, organizationId))
        )
    )
    await Promise.all(promises)
  })
}

// ==========================================
// Category Repository
// ==========================================

export async function getCategoriesByOrgId(organizationId: string) {
  return await db.query.serviceCategories.findMany({
    where: eq(serviceCategories.organizationId, organizationId),
    orderBy: [asc(serviceCategories.displayOrder), asc(serviceCategories.createdAt)],
  })
}

export async function getCategoryById(id: string) {
  return await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, id),
  })
}

export async function getCategoryBySlug(organizationId: string, slug: string) {
  return await db.query.serviceCategories.findFirst({
    where: and(
      eq(serviceCategories.organizationId, organizationId),
      eq(serviceCategories.slug, slug)
    ),
  })
}

export async function getCategoryByName(organizationId: string, name: string) {
  return await db.query.serviceCategories.findFirst({
    where: and(
      eq(serviceCategories.organizationId, organizationId),
      eq(serviceCategories.name, name)
    ),
  })
}

export async function createCategory(data: CategoryInsert) {
  const [newCategory] = await db.insert(serviceCategories).values(data).returning()
  return newCategory
}

export async function updateCategory(id: string, data: CategoryUpdate) {
  const [updatedCategory] = await db
    .update(serviceCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(serviceCategories.id, id))
    .returning()
  return updatedCategory
}

export async function deleteCategory(id: string, organizationId: string) {
  return await db
    .delete(serviceCategories)
    .where(and(eq(serviceCategories.id, id), eq(serviceCategories.organizationId, organizationId)))
}

export async function updateCategoryOrders(
  organizationId: string,
  orderedIds: string[]
) {
  return await db.transaction(async (tx) => {
    const promises = orderedIds.map((id, index) =>
      tx
        .update(serviceCategories)
        .set({ displayOrder: index, updatedAt: new Date() })
        .where(
          and(eq(serviceCategories.id, id), eq(serviceCategories.organizationId, organizationId))
        )
    )
    await Promise.all(promises)
  })
}

export async function countServicesInCategory(organizationId: string, categoryId: string): Promise<number> {
  const results = await db.query.services.findMany({
    columns: { id: true },
    where: and(
      eq(services.organizationId, organizationId),
      eq(services.categoryId, categoryId)
    )
  })
  return results.length
}
