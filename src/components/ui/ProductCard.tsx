import Link from "next/link"
import { formatPrice } from "@/lib/utils"

interface ProductCardProps {
  product: {
    slug: string
    name: string
    price: number
    comparePrice?: number | null
    images: string[]
    category?: { name: string } | null
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const imgSrc = product.images?.[0]
    ? product.images[0]
    : "/placeholder.svg"

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-lg overflow-hidden border border-stone-200 hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-stone-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4 space-y-1">
        {product.category && (
          <p className="text-xs text-stone-500 uppercase tracking-wider">
            {product.category.name}
          </p>
        )}
        <h3 className="font-medium text-stone-800 text-sm">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-900">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-stone-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
