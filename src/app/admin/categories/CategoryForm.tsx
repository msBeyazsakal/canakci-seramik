"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import ImageUpload from "@/components/ui/ImageUpload"

interface CategoryFormProps {
  initialData?: {
    id: string
    name: string
    description: string | null
    image: string | null
    order: number
    isActive: boolean
  }
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [image, setImage] = useState(initialData?.image || "")
  const [order, setOrder] = useState(initialData?.order.toString() || "0")
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const body = { name, description, image, order: parseInt(order), isActive }
    const url = initialData ? `/api/categories/${initialData.id}` : "/api/categories"
    const method = initialData ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push("/admin/categories")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Bir hata oluştu.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-stone-200 p-6 max-w-lg">
      <Input label="Kategori Adı" value={name} onChange={(e) => setName(e.target.value)} required />
      <Textarea label="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      <ImageUpload label="Görsel" value={image} onChange={(url) => setImage(url as string)} />
      <Input label="Sıra" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-stone-300" />
        Aktif
      </label>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : initialData ? "Güncelle" : "Oluştur"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>İptal</Button>
      </div>
    </form>
  )
}
