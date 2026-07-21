import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface EventCardProps {
  event: {
    id: string
    slug: string
    title: string
    description: string | null
    image: string | null
    startDate: Date
    location: string | null
    capacity: number
  }
}

function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:shadow-lg transition-shadow flex flex-col sm:flex-row"
    >
      <div className="sm:w-72 h-56 sm:h-auto bg-stone-100 overflow-hidden shrink-0">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 mb-3">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(event.startDate)}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.location}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-stone-800 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-sm text-stone-500 mt-2 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>
        {event.capacity > 0 && (
          <p className="text-xs text-stone-400 mt-4">Kapasite: {event.capacity} kişi</p>
        )}
      </div>
    </Link>
  )
}

export default async function EventsPage() {
  const now = new Date()

  const [upcomingEvents, pastEvents] = await Promise.all([
    prisma.event.findMany({
      where: { isActive: true, startDate: { gte: now } },
      orderBy: { startDate: "asc" },
    }),
    prisma.event.findMany({
      where: { isActive: true, startDate: { lt: now } },
      orderBy: { startDate: "desc" },
    }),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-semibold text-stone-800">Etkinlikler</h1>
        <p className="text-stone-500 mt-1">Seramik atölyeleri ve etkinliklerimiz</p>
      </div>

      <section className="mb-16">
        <h2 className="text-xl font-semibold text-stone-700 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          Yaklaşan Etkinlikler
        </h2>

        {upcomingEvents.length > 0 ? (
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <svg
              className="w-12 h-12 mx-auto text-stone-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-stone-400">Henüz planlanmış bir etkinlik bulunmuyor.</p>
          </div>
        )}
      </section>

      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-stone-700 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-stone-400 rounded-full" />
            Geçmiş Etkinlikler
          </h2>
          <div className="space-y-6 opacity-75">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
