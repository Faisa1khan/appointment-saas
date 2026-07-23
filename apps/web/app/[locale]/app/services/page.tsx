import { getTranslations } from "next-intl/server"
import { db } from "@/lib/db"
import { services, serviceCategories } from "@/lib/db/schema"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"
import { createClient } from "@/lib/supabase/server"
import { eq, desc, asc } from "drizzle-orm"
import { ServicesView } from "@/features/services/components/services-view"

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "services" })
  return { title: `${t("title")} | Arrivo` }
}

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const appUser = await ensureAppUser(user)
  const member = await db.query.organizationMembers.findFirst({
    where: (members, { eq }) => eq(members.userId, appUser.id)
  })

  if (!member) return null

  // Fetch categories and services
  const categoriesData = await db.select().from(serviceCategories)
    .where(eq(serviceCategories.organizationId, member.organizationId))
    .orderBy(asc(serviceCategories.displayOrder))

  const servicesData = await db.select().from(services)
    .where(eq(services.organizationId, member.organizationId))
    .orderBy(asc(services.displayOrder))

  return (
    <div className="container p-4 mx-auto max-w-5xl md:p-8">
      <ServicesView services={servicesData} categories={categoriesData} />
    </div>
  )
}
