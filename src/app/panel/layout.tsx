import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import PanelSidebar from "./PanelSidebar"

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  return (
    <div className="min-h-screen bg-stone-50">
      <PanelSidebar userName={session.user.name || null} userEmail={session.user.email!} />

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-stone-200">
          <div className="flex items-center justify-between px-6 py-3">
            <h1 className="text-lg font-semibold text-stone-800">Müşteri Paneli</h1>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
