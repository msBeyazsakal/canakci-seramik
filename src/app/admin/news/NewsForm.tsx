"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import ImageUpload from "@/components/ui/ImageUpload"

interface NewsFormProps {
  initialData?: {
    id: string
    title: string
    content: string | null
    excerpt: string | null
    image: string | null
    source: string | null
    sourceUrl: string | null
    isActive: boolean
  }
}

export default function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState(initialData?.title || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
  const [image, setImage] = useState(initialData?.image || "")
  const [source, setSource] = useState(initialData?.source || "")
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl || "")
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const body = { title, content, excerpt, image, source, sourceUrl, isActive }
    const url = initialData ? `/api/news/${initialData.id}` : "/api/news"
    const method = initialData ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push("/admin/news")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Bir hata oluştu.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-stone-200 p-6 max-w-2xl">
      <Input label="Haber Başlığı" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input label="Özet" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      <Textarea label="İçerik" value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
      <ImageUpload label="Görsel" value={image} onChange={(url) => setImage(url as string)} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Kaynak" value={source} onChange={(e) => setSource(e.target.value)} />
        <Input label="Kaynak URL" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
      </div>
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
