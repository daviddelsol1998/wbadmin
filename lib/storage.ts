import { serverUploadImage } from "./server-actions"

export async function uploadImage(file: File, folder = "wrestlers"): Promise<string | null> {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file)

    // Use server action to upload (bypasses RLS)
    return await serverUploadImage(base64, folder)
  } catch (error) {
    console.error("Error in uploadImage:", error)
    return null
  }
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
