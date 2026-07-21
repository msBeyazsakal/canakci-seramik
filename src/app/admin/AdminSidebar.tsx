"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Ürünler", icon: "🏺" },
  { href: "/admin/categories", label: "Kategoriler", icon: "📂" },
  { href: "/admin/sliders", label: "Slider", icon: "🎠" },
  { href: "/admin/events", label: "Etkinlikler", icon: "📅" },
  { href: "/admin/event-registrations", label: "Katılımlar", icon: "📋" },
  { href: "/admin/orders", label: "Siparişler", icon: "📦" },
  { href: "/admin/payment-receipts", label: "Dekontlar", icon: "📎" },
  { href: "/admin/news", label: "Medya", icon: "📰" },
  { href: "/admin/notifications", label: "Bildirimler", icon: "🔔" },
  { href: "/admin/messages", label: "Mesajlar", icon: "✉️" },
  { href: "/admin/settings", label: "Site Ayarları", icon: "⚙️" },
  { href: "/admin/users", label: "Kullanıcılar", icon: "👥" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-3 bg-amber-700 text-white rounded-lg shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen
          bg-stone-900 text-stone-300
          w-64 flex-shrink-0
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-4 border-b border-stone-700">
          <Link href="/admin" className="text-xl font-bold text-amber-400">
            Çanakçı
          </Link>
          <p className="text-xs text-stone-500 mt-0.5">Yönetim Paneli</p>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-amber-500/20 text-amber-400 font-medium"
                    : "hover:bg-stone-800 hover:text-stone-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
