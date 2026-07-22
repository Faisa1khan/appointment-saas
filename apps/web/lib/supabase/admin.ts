import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client
 * 
 * This client is instantiated with the Service Role Key, which bypasses all Row Level Security (RLS) policies.
 * It must NEVER be exposed to the client or used in client-side code.
 * 
 * Use this client ONLY for administrative operations that require elevated privileges,
 * such as deleting users during a transaction rollback.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key is missing')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
