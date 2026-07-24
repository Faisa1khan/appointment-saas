import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { ensureAppUser } from './ensure-app-user'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Retrieves the currently authenticated user's organization ID.
 * Throws an error if the user is not authenticated or does not belong to an organization.
 */
export async function getCurrentOrganizationId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AuthError("Not authenticated")

  const appUser = await ensureAppUser(user)
  const member = await db.query.organizationMembers.findFirst({
    where: (members, { eq }) => eq(members.userId, appUser.id)
  })

  if (!member) throw new AuthError("No organization found")
  return member.organizationId
}
