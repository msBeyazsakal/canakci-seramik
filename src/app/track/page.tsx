import { prisma } from "@/lib/prisma"
import { formatPrice, formatDate } from "@/lib/utils"
import Link from "next/link"

const statusLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoya Verildi",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>
}) {
  const { order, email } = await searchParams

  const orderData = order && email
    ? await prisma.order.findFirst({
        where: { orderNumber: order, customerEmail: email },
        include: { items: true },
      })
    : null

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-stone-800 mb-2">Sipariş Takip</h1>
      <p className="text-stone-500 mb-8">Sipariş numaranız ve e-posta adresinizle sipariş durumunuzu öğrenin.</p>

      <form className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Sipariş Numarası</label>
          <input
            name="order"
            defaultValue={order || ""}
            required
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            placeholder="SP-XXXXXXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">E-posta Adresi</label>
          <input
            name="email"
            type="email"
            defaultValue={email || ""}
            required
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            placeholder="Siparişte kullandığınız e-posta"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-amber-700 text-white py-2.5 rounded-lg hover:bg-amber-800 transition-colors text-sm font-medium"
        >
          Sorgula
        </button>
      </form>

      {order && !orderData && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          Sipariş bulunamadı. Sipariş numarası ve e-posta adresini kontrol edin.
        </div>
      )}

      {orderData && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider">Sipariş Numarası</p>
                <p className="text-lg font-bold text-stone-800">{orderData.orderNumber}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[orderData.status]}`}>
                {statusLabels[orderData.status] || orderData.status}
              </span>
            </div>
            <p className="text-sm text-stone-500">{formatDate(orderData.createdAt)}</p>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-3">Teslimat Bilgileri</h2>
            <div className="text-sm text-stone-600 space-y-1">
              <p>{orderData.customerName}</p>
              <p>{orderData.customerEmail}</p>
              {orderData.customerPhone && <p>{orderData.customerPhone}</p>}
              {orderData.customerAddress && <p>{orderData.customerAddress}</p>}
              {orderData.city && <p>{orderData.city}{orderData.district ? ` / ${orderData.district}` : ""}</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="font-semibold text-stone-800 mb-3">Ürünler</h2>
            <div className="divide-y divide-stone-100">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2.5 text-sm">
                  <span className="text-stone-600">
                    {item.productName} <span className="text-stone-400">x{item.quantity}</span>
                  </span>
                  <span className="font-medium text-stone-800">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-3 mt-1 border-t border-stone-200">
              <span className="font-semibold text-stone-800">Toplam</span>
              <span className="font-bold text-amber-700">{formatPrice(orderData.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-6">
        <Link href="/" className="text-sm text-amber-700 hover:text-amber-800">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
