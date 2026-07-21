import { prisma } from "@/lib/prisma"
import ProductCard from "@/components/ui/ProductCard"
import Link from "next/link"

export default async function ProductsPage(props: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await props.searchParams

  const where: Record<string, unknown> = { isActive: true }
  if (category) where.category = { slug: category }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: where as any,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-stone-800">Ürünler</h1>
        <p className="text-stone-500 mt-1">Tüm seramik ürünlerimiz</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/products"
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            !category
              ? "bg-stone-800 text-white shadow-sm"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Tümü
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat.slug
                ? "bg-stone-800 text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <svg
            className="w-16 h-16 mx-auto text-stone-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-stone-400">
            {category ? "Bu kategoride henüz ürün bulunmuyor." : "Henüz ürün eklenmemiş."}
          </p>
          {category && (
            <Link href="/products" className="text-primary hover:underline mt-2 inline-block text-sm">
              Tüm ürünleri görüntüle
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
