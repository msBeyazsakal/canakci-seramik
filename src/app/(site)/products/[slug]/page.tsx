import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { notFound } from "next/navigation"
import ProductCard from "@/components/ui/ProductCard"
import AddToCartButton from "@/components/ui/AddToCartButton"

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  })

  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { category: true },
    take: 4,
  })

  const images = product.images ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-sm text-stone-400 mb-10">
        <Link href="/" className="hover:text-stone-600 transition-colors">
          Ana Sayfa
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-stone-600 transition-colors">
          Ürünler
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-stone-600 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-stone-600 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        <div className="space-y-4">
          <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden">
            {images[0] ? (
              <img
                src={images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img src="/placeholder.svg" alt="Placeholder" className="w-32 h-32" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="w-20 h-20 shrink-0 bg-stone-100 rounded-lg overflow-hidden border border-stone-200"
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {product.category && (
            <p className="text-sm text-primary font-semibold uppercase tracking-widest">
              {product.category.name}
            </p>
          )}

          <h1 className="text-3xl font-semibold text-stone-800">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-stone-800">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-stone-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Stokta ({product.stock} adet)
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Stokta Yok
              </span>
            )}
          </div>

          <div className="w-full h-px bg-stone-200" />

          {product.description && (
            <div>
              <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-3">
                Açıklama
              </h3>
              <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <div className="w-full h-px bg-stone-200" />

          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: images[0] || "",
              stock: product.stock,
            }}
          />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-stone-800">Benzer Ürünler</h2>
            <p className="text-stone-500 mt-1">Aynı kategorideki diğer ürünler</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
