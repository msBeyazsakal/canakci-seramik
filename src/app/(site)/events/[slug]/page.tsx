import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { notFound } from "next/navigation"
import EventRegistrationForm from "@/components/ui/EventRegistrationForm"

export default async function EventDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  const event = await prisma.event.findUnique({
    where: { slug, isActive: true },
  })

  if (!event) notFound()

  const isPast = new Date() > event.startDate

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-sm text-stone-400 mb-10">
        <Link href="/" className="hover:text-stone-600 transition-colors">
          Ana Sayfa
        </Link>
        <span>/</span>
        <Link href="/events" className="hover:text-stone-600 transition-colors">
          Etkinlikler
        </Link>
        <span>/</span>
        <span className="text-stone-600 truncate">{event.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-8">
          <div className="h-72 sm:h-96 bg-stone-100 rounded-xl overflow-hidden">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-semibold text-stone-800 mb-4">{event.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-stone-500 mb-8">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(event.startDate)}
              </span>
              {event.time && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {event.time}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </span>
              )}
              {isPast && (
                <span className="inline-flex items-center gap-1.5 text-stone-400 line-through">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bu etkinlik sona erdi
                </span>
              )}
            </div>

            {event.description && (
              <div className="prose prose-stone max-w-none">
                {event.description.split("\n").map((line, i) => (
                  <p key={i} className="text-stone-600 leading-relaxed mb-4">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-stone-200 p-6 lg:sticky lg:top-24 space-y-6 shadow-sm">
            <div className="space-y-3 pb-4 border-b border-stone-100">
              {event.price > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500">Ücret</span>
                  <span className="font-semibold text-stone-800 text-lg">
                    {event.price.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              )}
              {event.capacity > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500">Kapasite</span>
                  <span className="font-semibold text-stone-800">
                    {event.capacity} kişi
                  </span>
                </div>
              )}
            </div>

            {isPast ? (
              <div className="text-center py-6 text-stone-400">
                <p className="text-sm">Bu etkinlik sona erdiği için kayıt alınamamaktadır.</p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-stone-800 mb-4">Kayıt Ol</h3>
                <EventRegistrationForm eventId={event.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
