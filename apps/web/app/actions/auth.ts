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
      return { error: 'An account with this email already exists.' }
    }
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create user account. Please try again.' }
  }

  const userId = authData.user.id
  let transactionFailed = false

  // 3. Drizzle Transaction
  try {
    await db.transaction(async (tx) => {
      // Idempotency check: Does this user already have an organization?
      const existingMember = await tx
        .select({ id: organizationMembers.id })
        .from(organizationMembers)
        .where(eq(organizationMembers.userId, userId))
        .limit(1)

      if (existingMember.length > 0) {
        // User is already an owner/member, no need to recreate
        return
      }

      // Generate temp organization name and slug
      const orgName = `${firstName} ${lastName}'s Business`
      const baseSlug = slugify(`${firstName} ${lastName}`) || 'org'
      const uniqueSlug = await generateUniqueSlug(tx, baseSlug)

      // Insert Organization
      const [org] = await tx
        .insert(organizations)
        .values({
          name: orgName,
          slug: uniqueSlug,
        })
        .returning({ id: organizations.id })

      // Insert Member
      await tx.insert(organizationMembers).values({
        organizationId: org.id,
        userId: userId,
        role: 'OWNER',
      })
    })
  } catch (dbError) {
    console.error('Registration Transaction Error:', dbError)
    transactionFailed = true
  }

  // 4. Rollback Auth User if DB transaction fails
  if (transactionFailed) {
    try {
      const adminClient = createAdminClient()
      await adminClient.auth.admin.deleteUser(userId)
    } catch (rollbackError) {
      console.error('CRITICAL: Failed to rollback user deletion', rollbackError)
    }
    return { error: 'Failed to complete registration setup. Please try again.' }
  }

  // 5. Success / Redirect
  // If session is null, email confirmation is required
  if (!authData.session) {
    return { success: true, message: 'Please check your email to verify your account.' }
  }

  // If session exists, user is logged in
  return { success: true, redirectUrl: '/onboarding' }
}
