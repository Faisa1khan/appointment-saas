import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  // First, run supabase update session logic (which refreshes tokens and handles auth redirects)
  const supabaseResponse = await updateSession(request)

  // If Supabase wants to redirect (e.g. unauthorized), respect that immediately
  if (supabaseResponse.headers.get('location')) {
    return supabaseResponse
  }

  // Otherwise, run next-intl middleware to handle localized routing
  const intlResponse = handleI18nRouting(request)

  // Merge any cookies that Supabase might have updated (like fresh auth tokens) into the intl response
  supabaseResponse.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie)
  })

  return intlResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/media assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
