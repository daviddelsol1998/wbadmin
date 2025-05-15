import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Global variables to store client instances
let browserClient: SupabaseClient | null = null
let serverClient: SupabaseClient | null = null

// Create a single supabase client for the browser
export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  // Create the client with a specific storage key to avoid conflicts
  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "wrestlebracket-admin-auth",
    },
  })

  return browserClient
}

// Server-side client (for server components and server actions)
export function getSupabaseServerClient() {
  // For server components, we need to create a new client each time
  // because server components are executed in isolation
  if (typeof window === "undefined") {
    const supabaseUrl = process.env.SUPABASE_URL as string
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
    return createClient(supabaseUrl, supabaseServiceKey)
  }

  // For client-side server actions, we can reuse the client
  if (serverClient) return serverClient

  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  serverClient = createClient(supabaseUrl, supabaseServiceKey)
  return serverClient
}
