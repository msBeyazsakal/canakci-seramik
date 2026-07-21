"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import ImageUpload from "@/components/ui/ImageUpload"

interface SliderFormProps {
  initialData?: {
    id: string
    title: string | null
    subtitle: string | null
    image: string
    link: string | null
    order: number
    isActive: boolean
  }
}

export default function SliderForm({ initialData }: SliderFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState(initialData?.title || "")
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "")
  const [image, setImage] = useState(initialData?.image || "")
  const [link, setLink] = useState(initialData?.link || "")
  const [order, setOrder] = useState(initialData?.order.toString() || "0")
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const body = { title, subtitle, image, link, order: parseInt(order), isActive }
    const url = initialData ? `/api/sliders/${initialData.id}` : "/api/sliders"
    const method = initialData ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push("/admin/sliders")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Bir hata oluştu.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-stone-200 p-6 max-w-lg">
      <Input label="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea label="Alt Başlık" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={2} />
      <ImageUpload label="Görsel" value={image} onChange={(url) => setImage(url as string)} />
      <Input label="Link (opsiyonel)" value={link} onChange={(e) => setLink(e.target.value)} />
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
