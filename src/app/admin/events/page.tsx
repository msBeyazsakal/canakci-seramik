import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import Button from "@/components/ui/Button"
import DeleteButton from "../DeleteButton"

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { registrations: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Etkinlikler</h1>
        <Link href="/admin/events/new">
          <Button>Yeni Etkinlik</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left p-3 font-medium text-stone-600">Başlık</th>
                <th className="text-left p-3 font-medium text-stone-600">Tarih</th>
                <th className="text-left p-3 font-medium text-stone-600">Konum</th>
                <th className="text-left p-3 font-medium text-stone-600">Kayıt</th>
                <th className="text-left p-3 font-medium text-stone-600">Durum</th>
                <th className="text-right p-3 font-medium text-stone-600">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="p-3 font-medium text-stone-800">{event.title}</td>
                  <td className="p-3 text-stone-500">{formatDate(event.startDate)}</td>
                  <td className="p-3 text-stone-500">{event.location || "-"}</td>
                  <td className="p-3 text-stone-500">
                    {event._count.registrations}
                    {event.capacity > 0 && ` / ${event.capacity}`}
                  </td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      event.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                    }`}>
                      {event.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/events/${event.id}`}>
                        <Button variant="outline" size="sm">Düzenle</Button>
                      </Link>
                      <DeleteButton endpoint={`/api/events/${event.id}`} />
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-400">
                    Henüz etkinlik eklenmemiş.
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
