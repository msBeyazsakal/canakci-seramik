import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import SliderForm from "../SliderForm"

export default async function EditSliderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const slider = await prisma.slider.findUnique({ where: { id } })
  if (!slider) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Slider Düzenle</h1>
      <SliderForm
        initialData={{
          id: slider.id,
          title: slider.title,
          subtitle: slider.subtitle,
          image: slider.image,
          link: slider.link,
          order: slider.order,
          isActive: slider.isActive,
        }}
      />
    </div>
  )
}
