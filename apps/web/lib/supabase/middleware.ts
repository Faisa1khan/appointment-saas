import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  // Strip locale prefix (e.g. /en/login -> /login)
  const pathWithoutLocale = pathname.replace(/^\/(en|hi)(\/|$)/, '/')

  const isAuthRoute = pathWithoutLocale.startsWith('/login') ||
    pathWithoutLocale.startsWith('/register') ||
    pathWithoutLocale.startsWith('/verify-email') ||
    pathWithoutLocale.startsWith('/forgot-password')

  const isProtectedRoute = pathWithoutLocale.startsWith('/app') ||
    pathWithoutLocale.startsWith('/dashboard') ||
    pathWithoutLocale.startsWith('/onboarding') ||
    pathWithoutLocale.startsWith('/settings') ||
    pathWithoutLocale.startsWith('/customers') ||
    pathWithoutLocale.startsWith('/bookings')

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
