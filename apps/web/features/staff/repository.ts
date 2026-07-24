import { db } from '@/lib/db'
import { resources } from '@/lib/db/schema'
import { eq, and, desc, asc, inArray } from 'drizzle-orm'

export type Staff = typeof resources.$inferSelect
export type NewStaff = typeof resources.$inferInsert

export async function getStaffByOrganization(organizationId: string): Promise<Staff[]> {
  return await db
    .select()
    .from(resources)
    .where(
      and(
        eq(resources.organizationId, organizationId),
        eq(resources.type, 'STAFF')
      )
    )
    .orderBy(asc(resources.displayOrder), desc(resources.createdAt))
}

export async function getStaffById(id: string, organizationId: string): Promise<Staff | undefined> {
  const result = await db
    .select()
    .from(resources)
    .where(
      and(
        eq(resources.id, id),
        eq(resources.organizationId, organizationId),
        eq(resources.type, 'STAFF')
      )
    )
    .limit(1)

  return result[0]
}

export async function getStaffBySlug(slug: string, organizationId: string): Promise<Staff | undefined> {
  const result = await db
    .select()
    .from(resources)
    .where(
      and(
        eq(resources.slug, slug),
        eq(resources.organizationId, organizationId),
        eq(resources.type, 'STAFF')
      )
    )
    .limit(1)

  return result[0]
}

export async function createStaff(data: Omit<NewStaff, 'type'>): Promise<Staff> {
  const result = await db
    .insert(resources)
    .values({ ...data, type: 'STAFF' })
    .returning()
  
  return result[0]
}

export async function updateStaff(id: string, organizationId: string, data: Partial<NewStaff>): Promise<Staff | undefined> {
  const result = await db
    .update(resources)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(resources.id, id),
        eq(resources.organizationId, organizationId),
        eq(resources.type, 'STAFF')
      )
    )
    .returning()
    
  return result[0]
}

export async function updateStaffStatus(id: string, organizationId: string, isActive: boolean): Promise<Staff | undefined> {
  const result = await db
    .update(resources)
    .set({ isActive, updatedAt: new Date() })
    .where(
      and(
        eq(resources.id, id),
        eq(resources.organizationId, organizationId),
        eq(resources.type, 'STAFF')
      )
    )
    .returning()
    
  return result[0]
}

export async function updateStaffOrder(updates: { id: string, displayOrder: number }[], organizationId: string): Promise<void> {
  await db.transaction(async (tx) => {
    // To avoid numerous single updates, we can do them one by one in a transaction
    // Drizzle doesn't have a bulk update with different values per row yet
    for (const update of updates) {
      await tx
        .update(resources)
        .set({ displayOrder: update.displayOrder, updatedAt: new Date() })
        .where(
          and(
            eq(resources.id, update.id),
            eq(resources.organizationId, organizationId),
            eq(resources.type, 'STAFF')
          )
        )
    }
  })
}
