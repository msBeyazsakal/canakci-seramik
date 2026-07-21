"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import ImageUpload from "@/components/ui/ImageUpload"

interface EventFormProps {
  initialData?: {
    id: string
    title: string
    description: string | null
    image: string | null
    startDate: Date
    endDate: Date | null
    time: string | null
    location: string | null
    price: number
    capacity: number
    isActive: boolean
  }
}

export default function EventForm({ initialData }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [image, setImage] = useState(initialData?.image || "")
  const [startDate, setStartDate] = useState(
    initialData ? new Date(initialData.startDate).toISOString().split("T")[0] : ""
  )
  const [endDate, setEndDate] = useState(
    initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : ""
  )
  const [time, setTime] = useState(initialData?.time || "")
  const [location, setLocation] = useState(initialData?.location || "")
  const [price, setPrice] = useState(initialData?.price.toString() || "0")
  const [capacity, setCapacity] = useState(initialData?.capacity.toString() || "0")
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const body = {
      title, description, image,
      startDate, endDate: endDate || null,
      time, location,
      price: parseFloat(price),
      capacity: parseInt(capacity),
      isActive,
    }
    const url = initialData ? `/api/events/${initialData.id}` : "/api/events"
    const method = initialData ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push("/admin/events")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Bir hata oluştu.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-stone-200 p-6 max-w-2xl">
      <Input label="Etkinlik Adı" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Textarea label="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
      <ImageUpload label="Görsel" value={image} onChange={(url) => setImage(url as string)} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Başlangıç Tarihi" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <Input label="Bitiş Tarihi" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Saat" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <Input label="Konum" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Ücret (₺)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input label="Kontenjan" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
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
