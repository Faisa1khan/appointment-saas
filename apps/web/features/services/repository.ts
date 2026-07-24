import { db } from '@/lib/db'
import { services } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export type ServiceInsert = typeof services.$inferInsert
export type ServiceUpdate = Partial<typeof services.$inferInsert>
export type Service = typeof services.$inferSelect

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
