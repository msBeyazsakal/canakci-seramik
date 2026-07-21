"use client"

import { useState, FormEvent } from "react"
import { useSession } from "next-auth/react"
import Input from "./Input"
import Textarea from "./Textarea"
import Button from "./Button"

interface EventRegistrationFormProps {
  eventId: string
}

export default function EventRegistrationForm({ eventId }: EventRegistrationFormProps) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    participantCount: 1,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/public/event-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventId,
          userId: session?.user?.id || null,
          participantCount: Number(formData.participantCount),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Bir hata oluştu")
      }

      setSuccess(true)
      setFormData({ name: "", email: "", phone: "", message: "", participantCount: 1 })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-stone-800">Kaydınız alındı!</p>
        <p className="text-sm text-stone-500 mt-1">
          En kısa sürede sizinle iletişime geçeceğiz.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Ad Soyad"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Input
        label="E-posta"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <Input
        label="Telefon"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-stone-700">
          Katılımcı Sayısı
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={formData.participantCount}
          onChange={(e) =>
            setFormData({ ...formData, participantCount: parseInt(e.target.value) || 1 })
          }
          className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-colors"
        />
      </div>
      <Textarea
        label="Mesaj (isteğe bağlı)"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Gönderiliyor..." : "Kaydol"}
      </Button>
    </form>
  )
}
