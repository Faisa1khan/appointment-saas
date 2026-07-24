"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { businessHours, businessClosures } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { createClient } from "@/lib/supabase/server"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { updateBusinessHoursSchema, UpdateBusinessHoursInput } from "../schemas/business-hours.schema"
import { createClosureSchema, CreateClosureInput } from "../schemas/business-closures.schema"
import { revalidatePath } from "next/cache"

async function getMemberAndOrg() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const appUser = await ensureAppUser(user)
  const member = await db.query.organizationMembers.findFirst({
    where: (members, { eq }) => eq(members.userId, appUser.id)
  })

  if (!member) throw new Error("Not part of an organization")
  return { member, appUser }
}

export async function updateBusinessHoursAction(data: UpdateBusinessHoursInput) {
  try {
    const { member } = await getMemberAndOrg()
    const validatedData = updateBusinessHoursSchema.parse(data)

    await db.transaction(async (tx) => {
      // For simplicity, we just delete existing hours and insert the new ones,
      // or we can use upsert. Since it's exactly 7 days, delete + insert is safe and clean.
      await tx.delete(businessHours).where(eq(businessHours.organizationId, member.organizationId))
      
      const insertData = validatedData.hours.map(h => ({
        organizationId: member.organizationId,
        dayOfWeek: h.dayOfWeek,
        isClosed: h.isClosed,
        openTime: h.isClosed ? null : h.openTime,
        closeTime: h.isClosed ? null : h.closeTime,
      }))
      
      await tx.insert(businessHours).values(insertData)
    })

    revalidatePath("/app/hours")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Validation failed", details: error.flatten() }
    }
    console.error("Failed to update business hours:", error)
    return { error: "Failed to update business hours" }
  }
}

export async function addClosureAction(data: CreateClosureInput) {
  try {
    const { member } = await getMemberAndOrg()
    const validatedData = createClosureSchema.parse(data)

    await db.insert(businessClosures).values({
      organizationId: member.organizationId,
      date: validatedData.date,
      reason: validatedData.reason,
    })

    revalidatePath("/app/hours")
    return { success: true }
  } catch (error) {
    console.error("Failed to add closure:", error)
    return { error: "Failed to add holiday/closure" }
  }
}

export async function removeClosureAction(closureId: string) {
  try {
    const { member } = await getMemberAndOrg()

    await db.delete(businessClosures).where(
      and(
        eq(businessClosures.id, closureId),
        eq(businessClosures.organizationId, member.organizationId) // security check
      )
    )

    revalidatePath("/app/hours")
    return { success: true }
  } catch (error) {
    console.error("Failed to remove closure:", error)
    return { error: "Failed to remove holiday/closure" }
  }
}
