"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Button from "@/components/ui/Button"

interface DeleteButtonProps {
  endpoint: string
  redirect?: string
  onSuccess?: () => void
}

export default function DeleteButton({ endpoint, redirect, onSuccess }: DeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Silmek istediğinize emin misiniz?")) return
    setLoading(true)

    const res = await fetch(endpoint, { method: "DELETE" })
    if (res.ok) {
      if (redirect) {
        router.push(redirect)
      } else {
        router.refresh()
      }
      onSuccess?.()
    } else {
      const data = await res.json()
      alert(data.error || "Silme işlemi başarısız.")
    }
    setLoading(false)
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? "Siliniyor..." : "Sil"}
    </Button>
  )
}
