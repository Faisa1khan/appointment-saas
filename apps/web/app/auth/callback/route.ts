import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  const next = searchParams.get('next')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // If Supabase returned an error (e.g., otp_expired), redirect to our custom error page
  if (error) {
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', error)
    if (errorDescription) {
      errorUrl.searchParams.set('message', errorDescription)
    }
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      const errorUrl = new URL('/auth/error', origin)
      errorUrl.searchParams.set('error', 'session_exchange_failed')
      errorUrl.searchParams.set('message', exchangeError.message)
      return NextResponse.redirect(errorUrl)
    }

    const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
    const isLocalEnv = process.env.NODE_ENV === 'development'

    // If next is /reset-password, we MUST NOT sign them out, and we redirect them to reset-password
    if (next === '/reset-password') {
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    // For standard email verification, sign out immediately to enforce manual login
    await supabase.auth.signOut()

    // Success! Redirect to login page
    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}/login?verified=true`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}/login?verified=true`)
    } else {
      return NextResponse.redirect(`${origin}/login?verified=true`)
    }
  }

  // If no code and no error was present, this is an invalid request to the callback
  const errorUrl = new URL('/auth/error', origin)
  errorUrl.searchParams.set('error', 'invalid_request')
  errorUrl.searchParams.set('message', 'No authentication code was provided.')
  return NextResponse.redirect(errorUrl)
}
