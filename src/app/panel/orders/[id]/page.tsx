import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatDate, formatPrice } from "@/lib/utils"
import PaymentReceiptUpload from "@/components/ui/PaymentReceiptUpload"

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

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Ödeme Bekleniyor",
  PAID: "Ödendi",
  REFUNDED: "İade Edildi",
  CANCELLED: "İptal Edildi",
}

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  REFUNDED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const timeline: Record<string, { label: string; date: string }[]> = {
  PENDING: [
    { label: "Sipariş Oluşturuldu", date: "createdAt" },
  ],
  CONFIRMED: [
    { label: "Sipariş Oluşturuldu", date: "createdAt" },
    { label: "Sipariş Onaylandı", date: "updatedAt" },
  ],
  PREPARING: [
    { label: "Sipariş Oluşturuldu", date: "createdAt" },
    { label: "Sipariş Onaylandı", date: "updatedAt" },
    { label: "Hazırlanıyor", date: "updatedAt" },
  ],
  SHIPPED: [
    { label: "Sipariş Oluşturuldu", date: "createdAt" },
    { label: "Sipariş Onaylandı", date: "updatedAt" },
    { label: "Hazırlanıyor", date: "updatedAt" },
    { label: "Kargoya Verildi", date: "updatedAt" },
  ],
  DELIVERED: [
    { label: "Sipariş Oluşturuldu", date: "createdAt" },
    { label: "Sipariş Onaylandı", date: "updatedAt" },
    { label: "Hazırlanıyor", date: "updatedAt" },
    { label: "Kargoya Verildi", date: "updatedAt" },
    { label: "Teslim Edildi", date: "updatedAt" },
  ],
  CANCELLED: [
    { label: "Sipariş Oluşturuldu", date: "createdAt" },
    { label: "İptal Edildi", date: "updatedAt" },
  ],
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) return null

  const { id } = await params

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { customerEmail: session.user.email },
      ],
    },
    include: { items: true, paymentReceipts: { orderBy: { createdAt: "desc" } } },
  })

  if (!order) notFound()

  const bankSettings = await prisma.siteSetting.findMany({
    where: {
      key: { in: ["bank_name", "bank_branch", "bank_iban", "bank_account_name"] },
    },
  })

  const bankInfo: Record<string, string> = {}
  bankSettings.forEach((s) => { bankInfo[s.key] = s.value })

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/panel/orders" className="text-sm text-amber-700 hover:text-amber-800 mb-2 inline-block">
            &larr; Siparişlerime Dön
          </Link>
          <h2 className="text-2xl font-semibold text-stone-800">Sipariş #{order.orderNumber}</h2>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status] || ""}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="font-semibold text-stone-800 mb-3">Sipariş Durumu</h3>
        <div className="space-y-3">
          {(timeline[order.status] || timeline.PENDING).map((step, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-amber-700 mt-1" />
                {idx < (timeline[order.status] || timeline.PENDING).length - 1 && (
                  <div className="w-0.5 h-6 bg-amber-200" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-700">{step.label}</p>
                {step.date === "createdAt" && (
                  <p className="text-xs text-stone-400">{formatDate(order.createdAt)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-800">Ürünler</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
              {item.productImage && (
                <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800">{item.productName}</p>
                <p className="text-xs text-stone-500">{item.quantity} adet x {formatPrice(item.price)}</p>
              </div>
              <p className="text-sm font-semibold text-stone-800">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex justify-between">
          <span className="text-sm font-semibold text-stone-800">Toplam</span>
          <span className="text-sm font-bold text-amber-700">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-semibold text-stone-800 mb-3">Teslimat Bilgileri</h3>
          <div className="space-y-1.5 text-sm text-stone-600">
            <p><span className="font-medium text-stone-700">Ad:</span> {order.customerName}</p>
            <p><span className="font-medium text-stone-700">E-posta:</span> {order.customerEmail}</p>
            {order.customerPhone && <p><span className="font-medium text-stone-700">Telefon:</span> {order.customerPhone}</p>}
            {order.customerAddress && <p><span className="font-medium text-stone-700">Adres:</span> {order.customerAddress}</p>}
            {order.city && <p><span className="font-medium text-stone-700">Şehir:</span> {order.city}</p>}
            {order.district && <p><span className="font-medium text-stone-700">İlçe:</span> {order.district}</p>}
            {order.notes && <p><span className="font-medium text-stone-700">Not:</span> {order.notes}</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-semibold text-stone-800 mb-3">Ödeme Bilgileri</h3>
          <div className="space-y-1.5 text-sm text-stone-600">
            <p><span className="font-medium text-stone-700">Yöntem:</span> Havale / EFT</p>
            <p>
              <span className="font-medium text-stone-700">Durum:</span>{" "}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStatusColors[order.paymentStatus] || ""}`}>
                {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
              </span>
            </p>
          </div>

          {(order.paymentStatus === "PENDING") && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1.5 text-sm">
              <p className="font-medium text-amber-800 mb-2">Havale/EFT Yapılacak Hesap Bilgileri</p>
              {bankInfo.bank_name && <p className="text-stone-600"><span className="font-medium text-stone-700">Banka:</span> {bankInfo.bank_name}</p>}
              {bankInfo.bank_branch && <p className="text-stone-600"><span className="font-medium text-stone-700">Şube:</span> {bankInfo.bank_branch}</p>}
              {bankInfo.bank_iban && <p className="text-stone-600"><span className="font-medium text-stone-700">IBAN:</span> {bankInfo.bank_iban}</p>}
              {bankInfo.bank_account_name && <p className="text-stone-600"><span className="font-medium text-stone-700">Alıcı:</span> {bankInfo.bank_account_name}</p>}
              <p className="text-xs text-amber-600 mt-2">
                Havale işleminiz sonrası siparişiniz incelenip onaylanacaktır.
              </p>
            </div>
          )}
        </div>
      </div>

      {(order.paymentStatus === "PENDING") && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <PaymentReceiptUpload orderId={order.id} existingReceipts={order.paymentReceipts} />
        </div>
      )}
    </div>
  )
}
