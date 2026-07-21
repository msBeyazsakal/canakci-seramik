import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import PaymentReceiptUpload from "@/components/ui/PaymentReceiptUpload"

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Ödeme Bekleniyor",
  PAID: "Ödendi",
  CANCELLED: "İptal Edildi",
}

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default async function EventRegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) return null

  const { id } = await params

  const registration = await prisma.eventRegistration.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { email: session.user.email },
      ],
    },
    include: { event: true, paymentReceipts: { orderBy: { createdAt: "desc" } } },
  })

  if (!registration) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/panel/events" className="text-sm text-amber-700 hover:text-amber-800 mb-2 inline-block">
          &larr; Etkinliklerime Dön
        </Link>
        <h2 className="text-2xl font-semibold text-stone-800 mt-1">Etkinlik Detayı</h2>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="font-semibold text-stone-800 mb-4">{registration.event.title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-stone-700">Tarih:</span>
            <p className="text-stone-600 mt-0.5">{formatDate(new Date(registration.event.startDate))}</p>
          </div>
          {registration.event.location && (
            <div>
              <span className="font-medium text-stone-700">Konum:</span>
              <p className="text-stone-600 mt-0.5">{registration.event.location}</p>
            </div>
          )}
        </div>
        {registration.event.description && (
          <div className="mt-4">
            <span className="text-sm font-medium text-stone-700">Açıklama:</span>
            <p className="text-sm text-stone-600 mt-0.5 whitespace-pre-line">{registration.event.description}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="font-semibold text-stone-800 mb-4">Kayıt Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-stone-700">Ad Soyad:</span>
            <p className="text-stone-600 mt-0.5">{registration.name}</p>
          </div>
          <div>
            <span className="font-medium text-stone-700">E-posta:</span>
            <p className="text-stone-600 mt-0.5">{registration.email}</p>
          </div>
          {registration.phone && (
            <div>
              <span className="font-medium text-stone-700">Telefon:</span>
              <p className="text-stone-600 mt-0.5">{registration.phone}</p>
            </div>
          )}
          <div>
            <span className="font-medium text-stone-700">Katılımcı Sayısı:</span>
            <p className="text-stone-600 mt-0.5">{registration.participantCount} kişi</p>
          </div>
          {registration.message && (
            <div className="md:col-span-2">
              <span className="font-medium text-stone-700">Not:</span>
              <p className="text-stone-600 mt-0.5">{registration.message}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-semibold text-stone-800 mb-3">Ödeme Durumu</h3>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${paymentStatusColors[registration.paymentStatus] || ""}`}>
            {paymentStatusLabels[registration.paymentStatus] || registration.paymentStatus}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-semibold text-stone-800 mb-3">Zaman Bilgisi</h3>
          <div className="space-y-1 text-sm text-stone-600">
            <p><span className="font-medium text-stone-700">Kayıt Tarihi:</span> {formatDate(registration.createdAt)}</p>
            {registration.updatedAt > registration.createdAt && (
              <p><span className="font-medium text-stone-700">Son Güncelleme:</span> {formatDate(registration.updatedAt)}</p>
            )}
          </div>
        </div>
      </div>

      {(registration.paymentStatus === "PENDING") && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <PaymentReceiptUpload eventRegistrationId={registration.id} existingReceipts={registration.paymentReceipts} />
        </div>
      )}
    </div>
  )
}
