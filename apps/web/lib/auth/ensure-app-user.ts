import { User } from '@supabase/supabase-js'
import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cookies, headers } from 'next/headers'

export async function ensureAppUser(authUser: User) {
  // 1. Check if user already exists
  const existing = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.authUserId, authUser.id))
    .limit(1)

  if (existing.length > 0) {
    return existing[0]
  }

  // 2. Generate Display Name
  // Priority: OAuth full_name -> firstName + lastName -> email username -> null
  const meta = authUser.user_metadata || {}
  let displayName: string | null = null

  if (meta.full_name) {
    displayName = meta.full_name
  } else if (meta.first_name || meta.last_name) {
    displayName = `${meta.first_name || ''} ${meta.last_name || ''}`.trim()
  } else if (authUser.email) {
    displayName = authUser.email.split('@')[0]
  }

  const avatarImageUrl = meta.avatar_url || null

  // 3. Detect Preferred Language
  // Priority: NEXT_LOCALE cookie -> Accept-Language header -> 'en'
  let preferredLanguage: 'en' | 'hi' = 'en'
  
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')
  
  if (localeCookie && (localeCookie.value === 'en' || localeCookie.value === 'hi')) {
    preferredLanguage = localeCookie.value as 'en' | 'hi'
  } else {
    const headersList = await headers()
    const acceptLanguage = headersList.get('accept-language')
    if (acceptLanguage && acceptLanguage.toLowerCase().includes('hi')) {
      preferredLanguage = 'hi'
    }
  }

  // 4. Timezone Detection
  // We can look for a timezone cookie (e.g. set by client), or default to UTC.
  let timezone = 'UTC'
  const tzCookie = cookieStore.get('timezone')
  if (tzCookie?.value) {
    timezone = tzCookie.value
  }

  // 5. Insert App User
  try {
    const [newAppUser] = await db
      .insert(appUsers)
      .values({
        authUserId: authUser.id,
        displayName,
        avatarImageUrl,
        preferredLanguage,
        timezone,
        theme: 'system',
      })
      .returning()
      
    return newAppUser
  } catch (error) {
    // In case of a race condition where the user was created just milliseconds ago,
    // catch the unique constraint violation and fetch the user again.
    const reFetched = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.authUserId, authUser.id))
      .limit(1)
      
    if (reFetched.length > 0) {
      return reFetched[0]
    }
    
    throw error
  }
}
