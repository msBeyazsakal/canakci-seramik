import { prisma } from "@/lib/prisma"
import { formatDate, formatPrice } from "@/lib/utils"
import Link from "next/link"

export default async function AdminDashboard() {
  const [
    productCount,
    categoryCount,
    eventCount,
    orderCount,
    messageCount,
    recentOrders,
    recentMessages,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.event.count(),
    prisma.order.count(),
    prisma.contactMessage.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ])

  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { paymentStatus: "PAID" },
  })

  const stats = [
    { label: "Ürünler", value: productCount, href: "/admin/products", color: "bg-amber-600" },
    { label: "Kategoriler", value: categoryCount, href: "/admin/categories", color: "bg-emerald-600" },
    { label: "Etkinlikler", value: eventCount, href: "/admin/events", color: "bg-blue-600" },
    { label: "Siparişler", value: orderCount, href: "/admin/orders", color: "bg-violet-600" },
    { label: "Mesajlar", value: messageCount, href: "/admin/messages", color: "bg-rose-600" },
  ]

  const statusLabels: Record<string, string> = {
    PENDING: "Bekliyor",
    CONFIRMED: "Onaylandı",
    PREPARING: "Hazırlanıyor",
    SHIPPED: "Kargolandı",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal Edildi",
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-4 border border-stone-200 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>
              {stat.value}
            </div>
            <p className="text-sm text-stone-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800">Son Siparişler</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              Tümünü Gör
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 && (
              <p className="text-sm text-stone-400">Henüz sipariş yok.</p>
            )}
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-stone-700">{order.orderNumber}</p>
                  <p className="text-xs text-stone-500">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-stone-700">{formatPrice(order.totalAmount)}</p>
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800">Son Mesajlar</h2>
            <Link href="/admin/messages" className="text-sm text-primary hover:underline">
              Tümünü Gör
            </Link>
          </div>
          <div className="space-y-3">
            {recentMessages.length === 0 && (
              <p className="text-sm text-stone-400">Henüz mesaj yok.</p>
            )}
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-3 rounded-lg bg-stone-50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-700">{msg.name}</p>
                  <span className="text-xs text-stone-400">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-stone-500 mt-1 truncate">{msg.message}</p>
                {!msg.isRead && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mt-1">
                    Okunmadı
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
