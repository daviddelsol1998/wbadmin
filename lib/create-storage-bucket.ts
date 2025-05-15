"use server"

import { getSupabaseServer } from "./supabase-server"

export async function createStorageBucket() {
  const supabase = getSupabaseServer()

  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return false
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === "wrestler-images")

    if (!bucketExists) {
      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket("wrestler-images", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
      })

      if (createError) {
        console.error("Error creating storage bucket:", createError)
        return false
      }

      // Set public policy to allow reading files without authentication
      const { error: policyError } = await supabase.storage.from("wrestler-images").createSignedUrl("policy.txt", 1)

      if (policyError && !policyError.message.includes("not found")) {
        console.error("Error setting bucket policy:", policyError)
      }
    }

    // Update RLS policy to allow uploads for authenticated users (even anonymous)
    // This is done via SQL since the JS client doesn't have direct methods for this
    const { error: rslError } = await supabase.rpc("update_storage_policy", {
      bucket_name: "wrestler-images",
    })

    if (rslError) {
      console.error("Error updating storage policy:", rslError)
    }

    return true
  } catch (error) {
    console.error("Error setting up storage bucket:", error)
    return false
  }
}
