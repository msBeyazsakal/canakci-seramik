"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications?unread=true")
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications.slice(0, 10))
        setUnreadCount(data.unreadCount)
      }
    } catch {}
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    setNotifications([])
    setUnreadCount(0)
  }

  const typeIcons: Record<string, string> = {
    NEW_ORDER: "🛒",
    NEW_EVENT_REGISTRATION: "📋",
    PAYMENT_RECEIPT: "📎",
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors"
      >
        <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-stone-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-stone-800">Bildirimler</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-amber-700 hover:text-amber-800">
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => markRead(n.id)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0"
                >
                  <span className="text-lg shrink-0 mt-0.5">{typeIcons[n.type] || "🔔"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-800">{n.title}</p>
                    {n.message && <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{n.message}</p>}
                  </div>
                </a>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-stone-400">
                Bildirim bulunmuyor
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
