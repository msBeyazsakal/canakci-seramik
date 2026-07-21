import { prisma } from "@/lib/prisma"
import SettingsForm from "./SettingsForm"

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany()
  const initialData: Record<string, string> = {}
  settings.forEach((s) => {
    initialData[s.key] = s.value
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Site Ayarları</h1>
      <SettingsForm initialData={initialData} />
    </div>
  )
}
