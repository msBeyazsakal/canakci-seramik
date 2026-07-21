import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EventForm from "../EventForm"

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Etkinlik Düzenle</h1>
      <EventForm
        initialData={{
          id: event.id,
          title: event.title,
          description: event.description,
          image: event.image,
          startDate: event.startDate,
          endDate: event.endDate,
          time: event.time,
          location: event.location,
          price: event.price,
          capacity: event.capacity,
          isActive: event.isActive,
        }}
      />
    </div>
  )
}
