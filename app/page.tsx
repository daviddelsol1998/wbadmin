import { AdminDashboard } from "@/components/admin-dashboard"
import { createStorageBucket } from "@/lib/create-storage-bucket"

export default async function Home() {
  // Create storage bucket if it doesn't exist
  await createStorageBucket()

  return (
    <main className="min-h-screen">
      <AdminDashboard />
    </main>
  )
}
