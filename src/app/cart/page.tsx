"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import Button from "@/components/ui/Button"

interface CartItem {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
}

interface StockInfo {
  [productId: string]: number
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [stock, setStock] = useState<StockInfo>({})
  const [loading, setLoading] = useState(true)

  const loadCart = async () => {
    const stored = localStorage.getItem("cart")
    let cart: CartItem[] = []
    if (stored) {
      try {
        cart = JSON.parse(stored)
      } catch {
        cart = []
      }
    }
    setItems(cart)

    if (cart.length > 0) {
      try {
        const ids = cart.map((i) => i.productId).join(",")
        const res = await fetch(`/api/public/products?ids=${ids}`)
        const data = await res.json()
        if (data.success) {
          const stockMap: StockInfo = {}
          data.products.forEach((p: { id: string; stock: number }) => {
            stockMap[p.id] = p.stock
          })
          setStock(stockMap)
        }
      } catch {
        // stock check fails silently
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadCart()
    window.addEventListener("focus", loadCart)
    window.addEventListener("cart-updated", loadCart)
    return () => {
      window.removeEventListener("focus", loadCart)
      window.removeEventListener("cart-updated", loadCart)
    }
  }, [])

  const hasStockIssue = items.some((item) => {
    const available = stock[item.productId]
    return available !== undefined && available < item.quantity
  })

  const updateQuantity = (productId: string, delta: number) => {
    const updated = items.map((item) => {
      if (item.productId === productId) {
        const maxStock = stock[productId]
        let newQty = item.quantity + delta
        if (maxStock !== undefined) newQty = Math.min(newQty, maxStock)
        newQty = Math.max(1, newQty)
        return { ...item, quantity: newQty }
      }
      return item
    })
    setItems(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
    window.dispatchEvent(new Event("cart-updated"))
  }

  const removeItem = (productId: string) => {
    const updated = items.filter((item) => item.productId !== productId)
    setItems(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
    window.dispatchEvent(new Event("cart-updated"))
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const goToCheckout = () => {
    if (hasStockIssue) return
    const params = new URLSearchParams()
    items.forEach((item) => {
      params.append("productId", item.productId)
      params.append("quantity", String(item.quantity))
    })
    router.push(`/checkout?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-stone-800 mb-8">Sepetim</h1>

      {items.length > 0 ? (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4">
                {item.image && (
                  <div className="w-20 h-20 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`} className="text-sm font-medium text-stone-800 hover:text-amber-700">
                    {item.name}
                  </Link>
                  <p className="text-sm text-amber-700 font-semibold mt-1">{formatPrice(item.price)}</p>
                  {stock[item.productId] !== undefined && (
                    <p className="text-xs text-stone-400 mt-0.5">Stok: {stock[item.productId]}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="w-8 h-8 rounded-md border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-stone-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="w-8 h-8 rounded-md border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
                  >
                    +
                  </button>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-stone-800">{formatPrice(item.price * item.quantity)}</p>
                  {stock[item.productId] !== undefined && item.quantity > stock[item.productId] && (
                    <p className="text-xs text-red-500 mt-1 whitespace-nowrap">Stok aşımı</p>
                  )}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-xs text-red-500 hover:text-red-600 mt-1"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5 mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-semibold text-stone-800">Toplam</span>
              <span className="text-xl font-bold text-amber-700">{formatPrice(total)}</span>
            </div>
            {hasStockIssue && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                Bazı ürünler için istediğiniz miktarda stok bulunmamaktadır. Lütfen miktarları azaltın.
              </div>
            )}
            <Button onClick={goToCheckout} className="w-full" disabled={hasStockIssue}>
              Alışverişi Tamamla
            </Button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <svg className="w-16 h-16 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p className="text-stone-500 mb-4">Sepetiniz boş</p>
          <Link
            href="/products"
            className="inline-block bg-amber-700 text-white px-6 py-2.5 rounded-lg hover:bg-amber-800 transition-colors text-sm"
          >
            Alışverişe Başla
          </Link>
        </div>
      )}
    </div>
  )
}
