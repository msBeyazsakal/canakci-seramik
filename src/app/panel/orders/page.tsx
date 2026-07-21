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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) return null

  const { status } = await searchParams

  const whereBase: { userId?: string; customerEmail?: string; status?: string } = {
    OR: [
      { userId: session.user.id },
      { customerEmail: session.user.email },
    ],
  } as any
  if (status && status !== "all") whereBase.status = status

  const orders = await prisma.order.findMany({
    where: whereBase as any,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })

  const statuses = [
    { value: "all", label: "Tümü" },
    { value: "PENDING", label: "Bekliyor" },
    { value: "CONFIRMED", label: "Onaylandı" },
    { value: "PREPARING", label: "Hazırlanıyor" },
    { value: "SHIPPED", label: "Kargoya Verildi" },
    { value: "DELIVERED", label: "Teslim Edildi" },
    { value: "CANCELLED", label: "İptal Edildi" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-stone-800">Siparişlerim</h2>
        <p className="text-stone-500 mt-1">Tüm siparişlerinizi görüntüleyin ve takip edin.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s.value}
            href={s.value === "all" ? "/panel/orders" : `/panel/orders?status=${s.value}`}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              (status === s.value || (!status && s.value === "all"))
                ? "bg-amber-700 text-white border-amber-700"
                : "bg-white text-stone-600 border-stone-200 hover:border-amber-300"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {orders.length > 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="divide-y divide-stone-100">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/panel/orders/${order.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-stone-800">{order.orderNumber}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || ""}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {formatDate(order.createdAt)} &middot; {order.items.length} ürün
                  </p>
                  {order.customerAddress && (
                    <p className="text-xs text-stone-400 truncate mt-0.5">
                      {order.city}{order.district ? ` / ${order.district}` : ""}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-stone-800">{formatPrice(order.totalAmount)}</p>
                  <p className="text-xs text-stone-500">{order.paymentMethod === "HAVALE_EFT" ? "Havale/EFT" : order.paymentMethod}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <svg className="w-12 h-12 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-stone-500 mb-3">Sipariş bulunamadı</p>
          <Link
            href="/products"
            className="inline-block text-sm bg-amber-700 text-white px-5 py-2.5 rounded-lg hover:bg-amber-800 transition-colors"
          >
            Alışverişe Başla
          </Link>
        </div>
      )}
    </div>
  )
}
