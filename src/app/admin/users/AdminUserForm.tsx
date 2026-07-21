"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

export default function AdminUserForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
      role: "ADMIN",
    }

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setSuccess(true)
      router.refresh()
      ;(e.target as HTMLFormElement).reset()
    } else {
      const data = await res.json()
      setError(data.error || "Bir hata oluştu.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-wrap">
      <Input name="name" placeholder="Ad Soyad" required />
      <Input name="email" type="email" placeholder="E-posta" required />
      <Input name="password" type="password" placeholder="Şifre" required />
      <Button type="submit" disabled={loading}>
        {loading ? "Ekleniyor..." : "Admin Ekle"}
      </Button>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
      {success && <p className="text-xs text-emerald-600 w-full">Admin başarıyla eklendi.</p>}
    </form>
  )
}
