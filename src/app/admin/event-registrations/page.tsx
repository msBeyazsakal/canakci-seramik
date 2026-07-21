import { prisma } from "@/lib/prisma"
import { formatDate, formatPrice } from "@/lib/utils"
import Button from "@/components/ui/Button"
import DeleteButton from "../DeleteButton"
import PaymentStatusSelect from "./PaymentStatusSelect"

export default async function AdminEventRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>
}) {
  const params = await searchParams
  const eventId = params.eventId || ""

  const where: Record<string, unknown> = {}
  if (eventId) where.eventId = eventId

  const [registrations, events] = await Promise.all([
    prisma.eventRegistration.findMany({
      where,
      include: { event: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.event.findMany({ orderBy: { title: "asc" } }),
  ])

  const paymentLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Bekliyor", color: "bg-amber-100 text-amber-700" },
    PAID: { label: "Ödendi", color: "bg-emerald-100 text-emerald-700" },
    REFUNDED: { label: "İade Edildi", color: "bg-red-100 text-red-700" },
    CANCELLED: { label: "İptal", color: "bg-stone-100 text-stone-500" },
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Etkinlik Katılımları</h1>

      <form className="flex gap-3" method="GET">
        <select
          name="eventId"
          defaultValue={eventId}
          className="px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="">Tüm Etkinlikler</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
        <Button type="submit" variant="secondary" size="sm">Filtrele</Button>
      </form>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left p-3 font-medium text-stone-600">Etkinlik</th>
                <th className="text-left p-3 font-medium text-stone-600">Ad Soyad</th>
                <th className="text-left p-3 font-medium text-stone-600">E-posta</th>
                <th className="text-left p-3 font-medium text-stone-600">Telefon</th>
                <th className="text-left p-3 font-medium text-stone-600">Kişi Sayısı</th>
                <th className="text-left p-3 font-medium text-stone-600">Ödeme</th>
                <th className="text-left p-3 font-medium text-stone-600">Tarih</th>
                <th className="text-right p-3 font-medium text-stone-600">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="p-3 text-stone-800">{reg.event.title}</td>
                  <td className="p-3 font-medium text-stone-800">{reg.name}</td>
                  <td className="p-3 text-stone-500">{reg.email}</td>
                  <td className="p-3 text-stone-500">{reg.phone || "-"}</td>
                  <td className="p-3 text-stone-500">{reg.participantCount}</td>
                  <td className="p-3">
                    <PaymentStatusSelect registrationId={reg.id} currentStatus={reg.paymentStatus} />
                    {reg.paymentAmount && <p className="text-xs text-stone-400 mt-0.5">{formatPrice(reg.paymentAmount)}</p>}
                  </td>
                  <td className="p-3 text-stone-500 text-xs">{formatDate(reg.createdAt)}</td>
                  <td className="p-3 text-right">
                    <DeleteButton endpoint={`/api/event-registrations?id=${reg.id}`} />
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-stone-400">
                    Henüz kayıt bulunmuyor.
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
