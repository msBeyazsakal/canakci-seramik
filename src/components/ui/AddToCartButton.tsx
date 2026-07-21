"use client"

import { useState } from "react"

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image: string
    stock: number
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]") as any[]
    const existing = cart.find((item: any) => item.productId === product.id)

    if (existing) {
      if (existing.quantity >= product.stock) return
      existing.quantity += 1
    } else {
      if (product.stock < 1) return
      cart.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: 1,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("cart-updated"))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={product.stock <= 0}
      className={`w-full sm:w-auto px-10 py-3.5 rounded-lg font-medium transition-all shadow-sm ${
        added
          ? "bg-emerald-600 text-white"
          : "bg-stone-800 text-white hover:bg-stone-700"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {added ? "✓ Sepete Eklendi" : product.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
    </button>
  )
}
