import { prisma } from "@/lib/prisma"
import { formatPrice, formatDate } from "@/lib/utils"
import Link from "next/link"
import Button from "@/components/ui/Button"

const statusLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargolandı",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-violet-100 text-violet-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const params = await searchParams
  const status = params.status || ""
  const search = params.search || ""

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Siparişler</h1>

      <form className="flex gap-3 flex-wrap" method="GET">
        <input
          name="search"
          defaultValue={search}
          placeholder="Sipariş no, isim, e-posta ara..."
          className="px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 w-64"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="">Tüm Durumlar</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <Button type="submit" variant="secondary" size="sm">Filtrele</Button>
      </form>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left p-3 font-medium text-stone-600">Sipariş No</th>
                <th className="text-left p-3 font-medium text-stone-600">Müşteri</th>
                <th className="text-left p-3 font-medium text-stone-600">Ürünler</th>
                <th className="text-left p-3 font-medium text-stone-600">Tutar</th>
                <th className="text-left p-3 font-medium text-stone-600">Durum</th>
                <th className="text-left p-3 font-medium text-stone-600">Ödeme</th>
                <th className="text-left p-3 font-medium text-stone-600">Tarih</th>
                <th className="text-right p-3 font-medium text-stone-600">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="p-3 font-mono text-xs text-stone-800">{order.orderNumber}</td>
                  <td className="p-3">
                    <p className="font-medium text-stone-800">{order.customerName}</p>
                    <p className="text-xs text-stone-500">{order.customerEmail}</p>
                  </td>
                  <td className="p-3 text-stone-500 text-xs">{order.items.length} ürün</td>
                  <td className="p-3 font-medium text-stone-800">{formatPrice(order.totalAmount)}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${statusColors[order.status] || ""}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      order.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" :
                      order.paymentStatus === "PENDING" ? "bg-amber-100 text-amber-700" :
                      "bg-stone-100 text-stone-500"
                    }`}>
                      {order.paymentStatus === "PAID" ? "Ödendi" :
                       order.paymentStatus === "PENDING" ? "Bekliyor" :
                       order.paymentStatus === "REFUNDED" ? "İade" : "İptal"}
                    </span>
                  </td>
                  <td className="p-3 text-stone-500 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="outline" size="sm">Detay</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-stone-400">
                    Sipariş bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
