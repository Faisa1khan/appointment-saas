import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ensureAppUser } from "@/lib/auth/ensure-app-user"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Ensure the canonical app_users record exists for this session
  await ensureAppUser(user)

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
