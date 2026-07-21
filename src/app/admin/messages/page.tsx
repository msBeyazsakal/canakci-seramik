import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import Button from "@/components/ui/Button"
import DeleteButton from "../DeleteButton"
import MarkReadButton from "./MarkReadButton"

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ isRead?: string }>
}) {
  const params = await searchParams
  const isRead = params.isRead

  const where: Record<string, unknown> = {}
  if (isRead === "true") where.isRead = true
  if (isRead === "false") where.isRead = false

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Mesajlar</h1>

      <form className="flex gap-3" method="GET">
        <select
          name="isRead"
          defaultValue={isRead || ""}
          className="px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="">Tüm Mesajlar</option>
          <option value="false">Okunmamış</option>
          <option value="true">Okunmuş</option>
        </select>
        <Button type="submit" variant="secondary" size="sm">Filtrele</Button>
      </form>

      <div className="space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`bg-white rounded-xl border p-4 ${
              !msg.isRead ? "border-amber-300 ring-1 ring-amber-200" : "border-stone-200"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-stone-800">{msg.name}</h3>
                  {!msg.isRead && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      Yeni
                    </span>
                  )}
                  <span className="text-xs text-stone-400">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-stone-500">{msg.email}</p>
                {msg.phone && <p className="text-xs text-stone-400">Tel: {msg.phone}</p>}
                {msg.subject && <p className="text-sm font-medium text-stone-700 mt-2">Konu: {msg.subject}</p>}
                <p className="text-sm text-stone-600 mt-2 whitespace-pre-wrap">{msg.message}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <MarkReadButton id={msg.id} isRead={msg.isRead} />
                <DeleteButton endpoint={`/api/contact-messages?id=${msg.id}`} />
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 text-stone-400 bg-white rounded-xl border border-stone-200">
            Mesaj bulunamadı.
          </div>
        )}
      </div>
    </div>
  )
}
