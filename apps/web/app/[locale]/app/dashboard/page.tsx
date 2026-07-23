import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { organizationMembers, organizations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { getTranslations } from "next-intl/server"

export default async function DashboardPage() {
  const t = await getTranslations("common.dashboard")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")
  
  const appUser = await ensureAppUser(user)

  // Verify they have an org
  const existingMember = await db
    .select({ orgId: organizationMembers.organizationId })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, appUser.id))
    .limit(1)

  if (existingMember.length === 0) {
    redirect("/app/onboarding")
  }

  const [org] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, existingMember[0].orgId))
    .limit(1)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-4 text-muted-foreground">Welcome back to {org.name}!</p>
    </div>
  )
}
