import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice, formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
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
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-stone-800 mb-2">Siparişiniz Oluşturuldu!</h1>
        <p className="text-stone-500 mb-1">Sipariş numaranız:</p>
        <p className="text-2xl font-bold text-amber-700 mb-4">{order.orderNumber}</p>
        <p className="text-sm text-stone-500">{formatDate(order.createdAt)}</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <h2 className="font-semibold text-stone-800 mb-3">Sipariş Özeti</h2>
        <div className="divide-y divide-stone-100">
          {order.items.map((item) => (
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
          <span className="font-bold text-amber-700">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <h2 className="font-semibold text-stone-800 mb-3">Havale/EFT ile Ödeme</h2>
        <p className="text-sm text-stone-600 mb-4">
          Siparişinizin onaylanabilmesi için lütfen aşağıdaki banka hesabına toplam tutarı havale/EFT yapınız.
          Havale işleminiz sonrası siparişiniz incelenip onaylanacaktır.
        </p>
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 space-y-2">
          {bankInfo.bank_name && (
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Banka</span>
              <span className="font-medium text-stone-800">{bankInfo.bank_name}</span>
            </div>
          )}
          {bankInfo.bank_branch && (
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Şube</span>
              <span className="font-medium text-stone-800">{bankInfo.bank_branch}</span>
            </div>
          )}
          {bankInfo.bank_iban && (
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">IBAN</span>
              <span className="font-medium text-stone-800 select-all">{bankInfo.bank_iban}</span>
            </div>
          )}
          {bankInfo.bank_account_name && (
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Alıcı Adı</span>
              <span className="font-medium text-stone-800">{bankInfo.bank_account_name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-sm text-blue-800 mb-6">
        <p className="font-medium mb-1">Ödeme Bildirimi</p>
        <p>Havale işleminizi gerçekleştirdikten sonra sipariş detay sayfasından ödeme bildiriminde bulunabilirsiniz. Siparişiniz ödemeniz kontrol edildikten sonra onaylanacaktır.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/track?order=${order.orderNumber}&email=${order.customerEmail}`}
          className="text-center px-6 py-2.5 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors text-sm"
        >
          Siparişini Takip Et
        </Link>
        <Link
          href="/"
          className="text-center px-6 py-2.5 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors text-sm"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
