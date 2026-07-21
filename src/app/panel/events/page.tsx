"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { formatDate } from "@/lib/utils"

interface EventRegistration {
  id: string
  eventId: string
  name: string
  email: string
  phone: string | null
  participantCount: number
  paymentStatus: string
  createdAt: string
  event: {
    id: string
    title: string
    slug: string
    startDate: string
    location: string | null
  }
}

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Ödeme Bekleniyor",
  PAID: "Ödendi",
}

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
}

export default function EventRegistrationsPage() {
  const { data: session } = useSession()
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/event-registrations")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setRegistrations(data.registrations)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id: string) => {
    if (!confirm("Bu etkinlik kaydını iptal etmek istediğinize emin misiniz?")) return
    setCancelling(id)
    try {
      const res = await fetch(`/api/event-registrations/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id))
      } else {
        alert(data.error || "İptal sırasında bir hata oluştu")
      }
    } catch {
      alert("İptal sırasında bir hata oluştu")
    } finally {
      setCancelling(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-stone-800">Etkinlik Kayıtlarım</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-stone-800">Etkinlik Kayıtlarım</h2>
        <p className="text-stone-500 mt-1">Katıldığınız etkinlikler ve kayıt durumları.</p>
      </div>

      {registrations.length > 0 ? (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <div key={reg.id} className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <a href={`/panel/events/${reg.id}`} className="font-medium text-stone-800 hover:text-amber-700 transition-colors">
                    {reg.event.title}
                  </a>
                  <p className="text-xs text-stone-500 mt-1">
                    {formatDate(new Date(reg.event.startDate))}
                    {reg.event.location && ` - ${reg.event.location}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-xs text-stone-500">{reg.participantCount} kişi</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStatusColors[reg.paymentStatus] || ""}`}>
                      {paymentStatusLabels[reg.paymentStatus] || reg.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-stone-400">{formatDate(new Date(reg.createdAt))}</span>
                  <button
                    onClick={() => handleCancel(reg.id)}
                    disabled={cancelling === reg.id}
                    className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {cancelling === reg.id ? "İptal ediliyor..." : "İptal Et"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <svg className="w-12 h-12 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-stone-500 mb-3">Henüz bir etkinliğe kaydolmadınız</p>
          <a
            href="/events"
            className="inline-block text-sm bg-amber-700 text-white px-5 py-2.5 rounded-lg hover:bg-amber-800 transition-colors"
          >
            Etkinlikleri Gör
          </a>
        </div>
      )}
    </div>
  )
}
