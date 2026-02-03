import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Client-side Supabase client
 * Use this in Client Components and browser-side code
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

/**
 * Create a Supabase client with custom options
 * Useful for specific use cases like Real-time subscriptions
 */
export const createSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Export types for convenience
export type { Database } from '@/types/database.types'
