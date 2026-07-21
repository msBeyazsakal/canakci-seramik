"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import ImageUpload from "@/components/ui/ImageUpload"
import { slugify } from "@/lib/utils"

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  categories: Category[]
  initialData?: {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    comparePrice: number | null
    stock: number
    images: string[]
    categoryId: string | null
    featured: boolean
    isActive: boolean
  }
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState(initialData?.name || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [price, setPrice] = useState(initialData?.price.toString() || "")
  const [comparePrice, setComparePrice] = useState(initialData?.comparePrice?.toString() || "")
  const [stock, setStock] = useState(initialData?.stock.toString() || "0")
  const [description, setDescription] = useState(initialData?.description || "")
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "")
  const [featured, setFeatured] = useState(initialData?.featured || false)
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [images, setImages] = useState<string[]>(initialData?.images || [])

  function handleNameChange(value: string) {
    setName(value)
    if (!initialData) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const body = {
      name,
      slug,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      stock: parseInt(stock),
      description,
      categoryId: categoryId || null,
      featured,
      isActive,
      images,
    }

    const url = initialData ? `/api/products/${initialData.id}` : "/api/products"
    const method = initialData ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push("/admin/products")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Bir hata oluştu.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-stone-200 p-6">
      <Input
        label="Ürün Adı"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        required
      />
      <Input
        label="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fiyat (₺)"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Input
          label="Karşılaştırma Fiyatı (₺)"
          type="number"
          step="0.01"
          value={comparePrice}
          onChange={(e) => setComparePrice(e.target.value)}
        />
      </div>
      <Input
        label="Stok"
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />
      <Textarea
        label="Açıklama"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Kategori</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="">Kategori seçin</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <ImageUpload
        label="Görseller"
        multiple
        value={images}
        onChange={(urls) => setImages(urls as string[])}
      />
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-stone-300" />
          Öne Çıkan
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-stone-300" />
          Aktif
        </label>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : initialData ? "Güncelle" : "Oluştur"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
      </div>
    </form>
  )
}
