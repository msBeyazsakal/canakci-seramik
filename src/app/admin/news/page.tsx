import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import Button from "@/components/ui/Button"
import DeleteButton from "../DeleteButton"

export default async function AdminNewsPage() {
  const newsList = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Medya / Haberler</h1>
        <Link href="/admin/news/new">
          <Button>Yeni Haber</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left p-3 font-medium text-stone-600">Başlık</th>
                <th className="text-left p-3 font-medium text-stone-600">Özet</th>
                <th className="text-left p-3 font-medium text-stone-600">Kaynak</th>
                <th className="text-left p-3 font-medium text-stone-600">Durum</th>
                <th className="text-left p-3 font-medium text-stone-600">Tarih</th>
                <th className="text-right p-3 font-medium text-stone-600">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {newsList.map((item) => (
                <tr key={item.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="p-3 font-medium text-stone-800 max-w-xs truncate">{item.title}</td>
                  <td className="p-3 text-stone-500 max-w-xs truncate">{item.excerpt || "-"}</td>
                  <td className="p-3 text-stone-500">{item.source || "-"}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                    }`}>
                      {item.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="p-3 text-stone-500 text-xs">{formatDate(item.createdAt)}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/news/${item.id}`}>
                        <Button variant="outline" size="sm">Düzenle</Button>
                      </Link>
                      <DeleteButton endpoint={`/api/news/${item.id}`} />
                    </div>
                  </td>
                </tr>
              ))}
              {newsList.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-400">
                    Henüz haber eklenmemiş.
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
