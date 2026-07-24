"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { organizations, organizationMembers, appUsers, serviceCategories, businessHours } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { createClient } from "@/lib/supabase/server"

const onboardingSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  timezone: z.string().min(1, "Timezone is required"),
})

export async function checkSlugAvailability(slug: string) {
  try {
    const existing = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug.toLowerCase()))
      .limit(1)

    return { available: existing.length === 0 }
  } catch (error) {
    console.error("Error checking slug availability:", error)
    return { available: false, error: "Failed to verify slug" }
  }
}

type OnboardingResult = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function completeOnboarding(formData: z.infer<typeof onboardingSchema>): Promise<OnboardingResult> {
  try {
    const validatedData = onboardingSchema.parse(formData)
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Not authenticated" }
    }

    // Get the canonical app user
    const existingAppUser = await db
      .select({ id: appUsers.id })
      .from(appUsers)
      .where(eq(appUsers.authUserId, user.id))
      .limit(1)

    if (existingAppUser.length === 0) {
      return { error: "Application user not found" }
    }

    const appUserId = existingAppUser[0].id

    // Check if they already have an org
    const existingMember = await db
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, appUserId))
      .limit(1)

    if (existingMember.length > 0) {
      return { error: "User already belongs to an organization" }
    }

    // Double check slug is still available
    const { available } = await checkSlugAvailability(validatedData.slug)
    if (!available) {
      return { fieldErrors: { slug: ["This URL is already taken."] } as Record<string, string[]> }
    }

    // Create organization and member in a transaction
    await db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organizations)
        .values({
          name: validatedData.name,
          slug: validatedData.slug.toLowerCase(),
          timezone: validatedData.timezone,
          bookingInterval: 30, // Default MVP interval
          minAdvanceMinutes: 0,
          cancellationCutoffHours: 24,
        })
        .returning({ id: organizations.id })

      await tx.insert(organizationMembers).values({
        organizationId: org.id,
        userId: appUserId,
        role: 'OWNER',
      })

      // Seed default category
      await tx.insert(serviceCategories).values({
        organizationId: org.id,
        name: 'General',
      })

      // Seed default Business Hours (Mon-Fri 09:00-18:00, Sat-Sun Closed)
      const defaultHours = []
      for (let day = 0; day <= 6; day++) {
        const isWeekend = day === 0 || day === 6
        defaultHours.push({
          organizationId: org.id,
          dayOfWeek: day,
          isClosed: isWeekend,
          openTime: isWeekend ? null : '09:00:00',
          closeTime: isWeekend ? null : '18:00:00',
        })
      }
      await tx.insert(businessHours).values(defaultHours)
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { fieldErrors: error.flatten().fieldErrors }
    }
    console.error("Onboarding failed:", error)
    return { error: "Failed to complete onboarding. Please try again." }
  }
}
