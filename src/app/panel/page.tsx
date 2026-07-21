import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatDate, formatPrice } from "@/lib/utils"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const statusLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
}

export default async function PanelDashboard() {
  const session = await auth()
  if (!session?.user?.id) return null

  const emailFilter = { OR: [{ userId: session.user.id }, { customerEmail: session.user.email }] } as any
  const [orders, totalOrders, activeOrders, eventRegistrations] = await Promise.all([
    prisma.order.findMany({
      where: emailFilter,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    prisma.order.count({ where: emailFilter }),
    prisma.order.count({
      where: { ...emailFilter, status: { notIn: ["DELIVERED", "CANCELLED"] } },
    }),
    prisma.eventRegistration.count({
      where: { OR: [{ userId: session.user.id }, { email: session.user.email }] } as any,
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-stone-800">
          Hoş Geldiniz, {session.user.name || "Değerli Müşterimiz"}
        </h2>
        <p className="text-stone-500 mt-1">Siparişlerinizi ve etkinlik kayıtlarınızı buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <p className="text-sm text-stone-500">Toplam Sipariş</p>
          <p className="text-3xl font-bold text-stone-800 mt-1">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <p className="text-sm text-stone-500">Aktif Sipariş</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{activeOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <p className="text-sm text-stone-500">Etkinlik Kaydı</p>
          <p className="text-3xl font-bold text-stone-800 mt-1">{eventRegistrations}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-800">Son Siparişler</h3>
          <Link href="/panel/orders" className="text-sm text-amber-700 hover:text-amber-800 font-medium">
            Tümünü Gör
          </Link>
        </div>
        {orders.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/panel/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-stone-800">{order.orderNumber}</p>
                  <p className="text-xs text-stone-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-stone-700">{formatPrice(order.totalAmount)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || ""}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-stone-500 mb-3">Henüz siparişiniz bulunmuyor</p>
            <Link
              href="/products"
              className="inline-block text-sm bg-amber-700 text-white px-5 py-2.5 rounded-lg hover:bg-amber-800 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/products"
          className="bg-white rounded-xl border border-stone-200 p-5 hover:border-amber-300 transition-colors flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-stone-800">Alışverişe Başla</p>
            <p className="text-sm text-stone-500">Ürünlerimizi keşfedin</p>
          </div>
        </Link>
        <Link
          href="/events"
          className="bg-white rounded-xl border border-stone-200 p-5 hover:border-amber-300 transition-colors flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-stone-800">Etkinlikler</p>
            <p className="text-sm text-stone-500">Atölye ve etkinliklere katılın</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
