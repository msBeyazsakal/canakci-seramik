"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Button from "@/components/ui/Button"

interface MarkReadButtonProps {
  id: string
  isRead: boolean
}

export default function MarkReadButton({ id, isRead }: MarkReadButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    await fetch(`/api/contact-messages?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: !isRead }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <Button
      variant={isRead ? "ghost" : "secondary"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {isRead ? "Okunmadı İşaretle" : "Okundu İşaretle"}
    </Button>
  )
}
