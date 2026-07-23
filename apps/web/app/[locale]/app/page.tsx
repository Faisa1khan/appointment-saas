import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { organizationMembers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function AppRouter() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user has an organization
  const existingMember = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, user.id))
    .limit(1)

  if (existingMember.length > 0) {
    // User has an organization, redirect to dashboard
    redirect("/dashboard")
  } else {
    // No organization, redirect to onboarding
    redirect("/onboarding")
  }
}
