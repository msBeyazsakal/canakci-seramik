"use client"

import { useEffect, useState } from "react"
import { formatDate } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  isRead: boolean
  createdAt: string
}

const typeLabels: Record<string, string> = {
  NEW_ORDER: "🛒 Yeni Sipariş",
  NEW_EVENT_REGISTRATION: "📋 Yeni Etkinlik Kaydı",
  PAYMENT_RECEIPT: "📎 Ödeme Bildirimi",
  PAYMENT_RECEIPT_STATUS: "📎 Dekont Durumu",
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      if (data.success) setNotifications(data.notifications)
    } finally {
      setLoading(false)
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-stone-800">Bildirimler</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 h-16" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-stone-800">Bildirimler</h2>
          <p className="text-stone-500 mt-1">Sistem bildirimlerini görüntüleyin.</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="text-sm bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800"
          >
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <a
              key={n.id}
              href={n.link || "#"}
              className={`block bg-white rounded-xl border p-4 hover:border-amber-300 transition-colors ${n.isRead ? "border-stone-200" : "border-amber-200 bg-amber-50/30"}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0 mt-0.5">
                  {typeLabels[n.type]?.split(" ")[0] || "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-stone-800">{n.title}</p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />}
                  </div>
                  {n.message && <p className="text-xs text-stone-500 mt-0.5">{n.message}</p>}
                  <p className="text-xs text-stone-400 mt-1">{formatDate(new Date(n.createdAt))}</p>
                </div>
                <span className="text-xs text-stone-400 shrink-0">{typeLabels[n.type]?.split(" ").slice(1).join(" ") || ""}</span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-stone-500">Bildirim bulunmuyor.</p>
        </div>
      )}
    </div>
  )
}
