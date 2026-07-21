"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { formatPrice } from "@/lib/utils"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 h-20" />
          ))}
        </div>
      </div>
    }>
      <CheckoutPage />
    </Suspense>
  )
}

interface ProductInfo {
  id: string
  name: string
  price: number
  images: string[]
  stock: number
}

function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const [products, setProducts] = useState<ProductInfo[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    customerName: session?.user?.name || "",
    customerEmail: session?.user?.email || "",
    customerPhone: "",
    customerAddress: "",
    city: "",
    district: "",
    notes: "",
  })

  useEffect(() => {
    if (session?.user) {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            setForm((prev) => ({
              ...prev,
              customerName: data.user.name || prev.customerName,
              customerEmail: data.user.email || prev.customerEmail,
              customerPhone: data.user.phone || prev.customerPhone,
              customerAddress: data.user.address || prev.customerAddress,
              city: data.user.addressCity || prev.city,
              district: data.user.addressDistrict || prev.district,
            }))
          }
        })
        .catch(() => {})
    }
  }, [session])

  useEffect(() => {
    const productIds = searchParams.getAll("productId")
    const qtyParams = searchParams.getAll("quantity")

    if (productIds.length === 0) {
      router.push("/cart")
      return
    }

    const qtyMap: Record<string, number> = {}
    productIds.forEach((id, idx) => {
      qtyMap[id] = parseInt(qtyParams[idx] || "1", 10)
    })
    setQuantities(qtyMap)

    fetch(`/api/public/products?ids=${productIds.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.products)
      })
      .finally(() => setLoading(false))
  }, [searchParams, router])

  const total = products.reduce((sum, p) => sum + p.price * (quantities[p.id] || 1), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.customerName || !form.customerEmail) {
      setError("Ad ve e-posta zorunludur")
      return
    }
    if (!form.customerPhone) {
      setError("Telefon zorunludur")
      return
    }
    if (!form.customerAddress) {
      setError("Adres zorunludur")
      return
    }
    if (!form.city) {
      setError("Şehir zorunludur")
      return
    }
    if (!form.district) {
      setError("İlçe zorunludur")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: products.map((p) => ({
            productId: p.id,
            quantity: quantities[p.id] || 1,
          })),
          ...form,
          userId: session?.user?.id || null,
        }),
      })

      const data = await res.json()
      if (data.success) {
        localStorage.removeItem("cart")
        window.dispatchEvent(new Event("cart-updated"))
        router.push(`/order/${data.order.orderNumber}`)
      } else {
        setError(data.error || "Sipariş oluşturulamadı")
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 h-20" />
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-stone-500">Ürünler yüklenemedi.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-stone-800 mb-8">Sipariş Oluştur</h1>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
              <h2 className="font-semibold text-stone-800">Teslimat Bilgileri</h2>
              <Input
                label="Ad Soyad *"
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                required
              />
              <Input
                label="E-posta *"
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                required
              />
              <Input
                label="Telefon"
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                placeholder="5XX XXX XX XX"
              />
              <Textarea
                label="Adres"
                value={form.customerAddress}
                onChange={(e) => setForm((f) => ({ ...f, customerAddress: e.target.value }))}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Şehir"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
                <Input
                  label="İlçe"
                  value={form.district}
                  onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                />
              </div>
              <Textarea
                label="Sipariş Notu"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Varsa siparişinizle ilgili notlar..."
              />
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h2 className="font-semibold text-stone-800 mb-3">Ödeme Yöntemi</h2>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center gap-3">
                <input type="radio" checked readOnly className="accent-amber-700" />
                <div>
                  <p className="text-sm font-medium text-stone-800">Havale / EFT</p>
                  <p className="text-xs text-stone-500">Sipariş oluşturulduktan sonra banka hesap bilgilerimiz görüntülenecektir.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-stone-200 p-5 sticky top-24">
              <h2 className="font-semibold text-stone-800 mb-4">Sipariş Özeti</h2>
              <div className="divide-y divide-stone-100">
                {products.map((product) => {
                  const qty = quantities[product.id] || 1
                  return (
                    <div key={product.id} className="flex items-center gap-3 py-3">
                      {product.images?.[0] && (
                        <div className="w-12 h-12 rounded-md bg-stone-100 overflow-hidden shrink-0">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-800 truncate">{product.name}</p>
                        <p className="text-xs text-stone-500">{qty} adet</p>
                      </div>
                      <p className="text-sm font-medium text-stone-800">{formatPrice(product.price * qty)}</p>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-2">
                <span className="text-base font-semibold text-stone-800">Toplam</span>
                <span className="text-lg font-bold text-amber-700">{formatPrice(total)}</span>
              </div>
              <Button type="submit" disabled={submitting} className="w-full mt-4">
                {submitting ? "Sipariş Oluşturuluyor..." : "Siparişi Tamamla"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
