'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { organizations, organizationMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateUniqueSlug(tx: any, baseSlug: string) {
  let currentSlug = baseSlug
  let counter = 1
  while (true) {
    const existing = await tx
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, currentSlug))
      .limit(1)

    if (existing.length === 0) return currentSlug
    counter++
    currentSlug = `${baseSlug}-${counter}`
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerOwner(prevState: any, formData: FormData) {
  // 1. Validate Input
  const validatedFields = registerSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields. Please check your inputs.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { firstName, lastName, email, password } = validatedFields.data
  const supabase = await createClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const emailRedirectTo = `${siteUrl}/auth/callback?next=/onboarding`

  // 2. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  })

  if (authError) {
    // Handle specific idempotency case: user already exists
    if (authError.message.includes('already registered') || authError.status === 422) {
      return { error: 'An account with this email already exists. Please sign in instead.' }
    }
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create user account. Please try again.' }
  }

  // Supabase returns a fake user object with an empty identities array if the email already exists
  // and email enumeration protection is turned on.
  if (authData.user.identities && authData.user.identities.length === 0) {
    return { error: 'An account with this email already exists. Please sign in instead.' }
  }

  const authUserId = authData.user.id
  let transactionFailed = false

  // 3. Drizzle Transaction
  try {
    const { ensureAppUser } = await import('@/lib/auth/ensure-app-user')
    await ensureAppUser(authData.user)
  } catch (dbError) {
    console.error('Registration Transaction Error:', dbError)
    transactionFailed = true
  }

  // 4. Rollback Auth User if DB transaction fails
  if (transactionFailed) {
    try {
      const adminClient = createAdminClient()
      await adminClient.auth.admin.deleteUser(authUserId)
    } catch (rollbackError) {
      console.error('CRITICAL: Failed to rollback user deletion', rollbackError)
    }
    return { error: 'Failed to complete registration setup. Please try again.' }
  }

  // 5. Success / Redirect
  // If session is null, email confirmation is required
  if (!authData.session) {
    return { success: true, message: 'Please check your email to verify your account.', redirectUrl: `/verify-email?email=${encodeURIComponent(email)}` }
  }

  // If session exists, user is logged in
  return { success: true, redirectUrl: '/app' }
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields. Please check your inputs.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Incorrect email or password.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please verify your email before signing in.' }
    }
    return { error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}


const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function forgotPassword(prevState: any, formData: FormData) {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields. Please check your inputs.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email } = validatedFields.data
  const supabase = await createClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: 'Something went wrong. Please try again later.' }
  }

  return { success: true, message: 'If an account exists with this email, a password reset link has been sent.' }
}

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updatePassword(prevState: any, formData: FormData) {
  const validatedFields = updatePasswordSchema.safeParse({
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields. Please check your inputs.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { password } = validatedFields.data
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Failed to update password. Your link may have expired.' }
  }

  return { success: true, message: 'Password updated successfully.', redirectUrl: '/login' }
}
