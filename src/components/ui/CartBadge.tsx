"use client"

import { useEffect, useState } from "react"

export default function CartBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const update = () => {
      try {
        const raw = localStorage.getItem("cart")
        if (raw) {
          const items = JSON.parse(raw)
          const total = Array.isArray(items) ? items.reduce((s: number, i: { quantity?: number }) => s + (i.quantity || 1), 0) : 0
          setCount(total)
        } else {
          setCount(0)
        }
      } catch {
        setCount(0)
      }
    }

    update()
    window.addEventListener("focus", update)
    window.addEventListener("cart-updated", update)
    return () => {
      window.removeEventListener("focus", update)
      window.removeEventListener("cart-updated", update)
    }
  }, [])

  if (count === 0) return null

  return (
    <span className="absolute -top-2 -right-2 bg-stone-800 text-white text-[10px] font-medium min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
      {count > 99 ? "99+" : count}
    </span>
  )
}
