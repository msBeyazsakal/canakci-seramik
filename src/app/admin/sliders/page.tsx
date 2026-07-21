import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Button from "@/components/ui/Button"
import DeleteButton from "../DeleteButton"
import Image from "next/image"

export default async function AdminSlidersPage() {
  const sliders = await prisma.slider.findMany({
    orderBy: { order: "asc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Slider</h1>
        <Link href="/admin/sliders/new">
          <Button>Yeni Slider</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {sliders.map((slider, index) => (
          <div key={slider.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4">
            <div className="text-stone-400 font-medium text-sm w-8 text-center">{index + 1}</div>
            <div className="w-24 h-16 relative rounded overflow-hidden bg-stone-100 flex-shrink-0">
              <Image src={slider.image} alt={slider.title || ""} width={96} height={64} className="object-cover" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-800 truncate">{slider.title || "Başlıksız"}</p>
              {slider.subtitle && <p className="text-sm text-stone-500 truncate">{slider.subtitle}</p>}
              <div className="flex gap-2 mt-1">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                  slider.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                }`}>
                  {slider.isActive ? "Aktif" : "Pasif"}
                </span>
                <span className="text-xs text-stone-400">Sıra: {slider.order}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/admin/sliders/${slider.id}`}>
                <Button variant="outline" size="sm">Düzenle</Button>
              </Link>
              <DeleteButton endpoint={`/api/sliders/${slider.id}`} />
            </div>
          </div>
        ))}
        {sliders.length === 0 && (
          <div className="text-center py-12 text-stone-400 bg-white rounded-xl border border-stone-200">
            Henüz slider eklenmemiş.
          </div>
        )}
      </div>
    </div>
  )
}
