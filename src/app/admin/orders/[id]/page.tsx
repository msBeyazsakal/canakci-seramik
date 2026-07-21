import { prisma } from "@/lib/prisma"
import { formatPrice, formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import OrderStatusForm from "./OrderStatusForm"

const statusLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargolandı",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
}

const paymentLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  REFUNDED: "İade Edildi",
  CANCELLED: "İptal",
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  })

  if (!order) notFound()

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-stone-800">
        Sipariş #{order.orderNumber}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
          <h2 className="font-semibold text-stone-800">Müşteri Bilgileri</h2>
          <div className="text-sm space-y-1 text-stone-600">
            <p><span className="font-medium text-stone-700">Ad:</span> {order.customerName}</p>
            <p><span className="font-medium text-stone-700">E-posta:</span> {order.customerEmail}</p>
            <p><span className="font-medium text-stone-700">Telefon:</span> {order.customerPhone || "-"}</p>
            <p><span className="font-medium text-stone-700">Adres:</span> {order.customerAddress || "-"}</p>
            <p><span className="font-medium text-stone-700">Şehir:</span> {order.city || "-"}</p>
            <p><span className="font-medium text-stone-700">İlçe:</span> {order.district || "-"}</p>
          </div>
          {order.notes && (
            <div>
              <p className="text-sm font-medium text-stone-700">Notlar:</p>
              <p className="text-sm text-stone-600 mt-1">{order.notes}</p>
            </div>
          )}
          {order.user && (
            <p className="text-xs text-stone-400">Kayıtlı kullanıcı: {order.user.name} ({order.user.email})</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
          <h2 className="font-semibold text-stone-800">Sipariş Durumu</h2>
          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
          />
          <div className="text-sm text-stone-500 mt-4">
            <p>Ödeme Yöntemi: {order.paymentMethod || "-"}</p>
            <p>Toplam Tutar: {formatPrice(order.totalAmount)}</p>
            <p>Oluşturulma: {formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200">
          <h2 className="font-semibold text-stone-800">Ürünler</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="text-left p-3 font-medium text-stone-600">Ürün</th>
              <th className="text-left p-3 font-medium text-stone-600">Fiyat</th>
              <th className="text-left p-3 font-medium text-stone-600">Adet</th>
              <th className="text-right p-3 font-medium text-stone-600">Ara Toplam</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-stone-100">
                <td className="p-3 text-stone-800">{item.productName}</td>
                <td className="p-3 text-stone-600">{formatPrice(item.price)}</td>
                <td className="p-3 text-stone-600">{item.quantity}</td>
                <td className="p-3 text-right text-stone-800 font-medium">{formatPrice(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="p-3 text-right font-medium text-stone-700">Toplam</td>
              <td className="p-3 text-right font-bold text-stone-800">{formatPrice(order.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
