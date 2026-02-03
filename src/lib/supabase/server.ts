import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Server-side Supabase client for Server Components and API Routes
 * Handles cookie-based authentication
 */
export const createClient = () => {
    const cookieStore = cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

/**
 * Server-side Supabase admin client
 * Use with caution - bypasses RLS policies
 */
export const createAdminClient = () => {
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookies().get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookies().set({ name, value, ...options })
                    } catch (error) {
                        // Ignore
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookies().set({ name, value: '', ...options })
                    } catch (error) {
                        // Ignore
                    }
                },
            },
        }
    )
}
