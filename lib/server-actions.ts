"use server"

import { getSupabaseServer } from "./supabase-server"

export async function serverUploadImage(base64Image: string, folder = "wrestlers"): Promise<string | null> {
  try {
    const supabase = getSupabaseServer()

    // Convert base64 to buffer
    const base64Data = base64Image.split(",")[1]
    const buffer = Buffer.from(base64Data, "base64")

    // Create a unique file name
    const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.jpg`

    // Upload the file using the server client (bypasses RLS)
    const { data, error } = await supabase.storage.from("wrestler-images").upload(fileName, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    })

    if (error) {
      console.error("Server error uploading image:", error)
      return null
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("wrestler-images").getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error("Server error in image upload:", error)
    return null
  }
}
