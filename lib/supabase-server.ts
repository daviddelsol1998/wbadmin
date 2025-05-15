import { createClient } from "@supabase/supabase-js"
import { cache } from "react"

// Use React's cache function to deduplicate requests
export const createServerClient = cache(() => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  return createClient(supabaseUrl, supabaseServiceKey)
})

// For server components and server actions
export function getSupabaseServer() {
  return createServerClient()
}
