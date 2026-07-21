"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import NotificationBell from "@/components/ui/NotificationBell"

interface AdminTopBarProps {
  user: {
    name?: string | null
    email: string
    image?: string | null
  }
}

export default function AdminTopBar({ user }: AdminTopBarProps) {
  const router = useRouter()

  async function handleLogout() {
    await signOut({ redirect: false })
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-stone-200 px-4 md:px-6 py-3 flex items-center justify-between md:ml-0 ml-14">
      <div className="md:hidden" />
      <div className="flex items-center gap-4 ml-auto">
        <NotificationBell />
        <div className="text-right">
          <p className="text-sm font-medium text-stone-800">
            {user.name || "Admin"}
          </p>
          <p className="text-xs text-stone-500">{user.email}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-medium">
          {(user.name || "A")[0].toUpperCase()}
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Çıkış
        </Button>
      </div>
    </header>
  )
}
