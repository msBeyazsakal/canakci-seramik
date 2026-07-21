import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import Button from "@/components/ui/Button"
import DeleteButton from "../DeleteButton"
import Image from "next/image"

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categoryId?: string }>
}) {
  const params = await searchParams
  const search = params.search || ""
  const categoryId = params.categoryId || ""

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
    ]
  }
  if (categoryId) {
    where.categoryId = categoryId
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Ürünler</h1>
        <Link href="/admin/products/new">
          <Button>Yeni Ürün</Button>
        </Link>
      </div>

      <form className="flex gap-3 flex-wrap" method="GET">
        <input
          name="search"
          defaultValue={search}
          placeholder="Ürün ara..."
          className="px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <select
          name="categoryId"
          defaultValue={categoryId}
          className="px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <Button type="submit" variant="secondary" size="sm">Filtrele</Button>
      </form>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left p-3 font-medium text-stone-600">Görsel</th>
                <th className="text-left p-3 font-medium text-stone-600">İsim</th>
                <th className="text-left p-3 font-medium text-stone-600">Kategori</th>
                <th className="text-left p-3 font-medium text-stone-600">Fiyat</th>
                <th className="text-left p-3 font-medium text-stone-600">Stok</th>
                <th className="text-left p-3 font-medium text-stone-600">Durum</th>
                <th className="text-right p-3 font-medium text-stone-600">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="p-3">
                    {product.images[0] ? (
                      <div className="w-12 h-12 relative rounded overflow-hidden bg-stone-100">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-stone-100 flex items-center justify-center text-stone-400 text-xs">Yok</div>
                    )}
                  </td>
                  <td className="p-3 font-medium text-stone-800">{product.name}</td>
                  <td className="p-3 text-stone-500">{product.category?.name || "-"}</td>
                  <td className="p-3 text-stone-800">{formatPrice(product.price)}</td>
                  <td className="p-3">
                    <span className={`${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                    }`}>
                      {product.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button variant="outline" size="sm">Düzenle</Button>
                      </Link>
                      <DeleteButton endpoint={`/api/products/${product.id}`} />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-400">
                    Henüz ürün eklenmemiş.
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
