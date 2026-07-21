import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Button from "@/components/ui/Button"
import DeleteButton from "../DeleteButton"

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Kategoriler</h1>
        <Link href="/admin/categories/new">
          <Button>Yeni Kategori</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="text-left p-3 font-medium text-stone-600">Sıra</th>
              <th className="text-left p-3 font-medium text-stone-600">İsim</th>
              <th className="text-left p-3 font-medium text-stone-600">Slug</th>
              <th className="text-left p-3 font-medium text-stone-600">Ürünler</th>
              <th className="text-left p-3 font-medium text-stone-600">Durum</th>
              <th className="text-right p-3 font-medium text-stone-600">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="p-3 text-stone-500">{cat.order}</td>
                <td className="p-3 font-medium text-stone-800">{cat.name}</td>
                <td className="p-3 text-stone-500">{cat.slug}</td>
                <td className="p-3 text-stone-500">{cat._count.products}</td>
                <td className="p-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                    cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                  }`}>
                    {cat.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/categories/${cat.id}`}>
                      <Button variant="outline" size="sm">Düzenle</Button>
                    </Link>
                    <DeleteButton endpoint={`/api/categories/${cat.id}`} />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-stone-400">
                  Henüz kategori eklenmemiş.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
