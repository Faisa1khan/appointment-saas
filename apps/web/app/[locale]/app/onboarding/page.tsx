import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { organizationMembers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { OnboardingWizard } from "@/components/forms/onboarding-wizard"
import { getTranslations } from "next-intl/server"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")
  
  const appUser = await ensureAppUser(user)

  // Verify they don't already have an org
  const existingMember = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, appUser.id))
    .limit(1)

  if (existingMember.length > 0) {
    redirect("/app/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <OnboardingWizard defaultTimezone={appUser.timezone || "UTC"} />
    </div>
  )
}
