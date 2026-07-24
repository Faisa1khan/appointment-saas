import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { getCurrentOrganizationId } from "@/lib/auth/auth.service"
import { getStaffByOrganization } from "@/features/staff/repository"
import { StaffView } from "@/features/staff/components/staff-view"

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "staff" })
  return {
    title: t("title"),
  }
}

export default async function StaffPage() {
  const organizationId = await getCurrentOrganizationId()

  if (!organizationId) {
    redirect("/sign-in")
  }

  const staff = await getStaffByOrganization(organizationId)

  return (
    <div className="container p-4 mx-auto sm:p-6 lg:p-8 max-w-7xl">
      <StaffView staffMembers={staff} />
    </div>
  )
}
