"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { getSupabaseBrowserClient } from "./supabase"
import type { SupabaseClient } from "@supabase/supabase-js"

// Create a context to share the Supabase client
const SupabaseContext = createContext<SupabaseClient | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => getSupabaseBrowserClient())

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

// Hook to use the Supabase client
export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
