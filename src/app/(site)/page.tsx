import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import HeroSlider from "@/components/ui/HeroSlider"
import ProductCard from "@/components/ui/ProductCard"
import InstagramFeed from "@/components/ui/InstagramFeed"

export default async function HomePage() {
  const [sliders, featuredProducts, upcomingEvents, siteSettingsList] = await Promise.all([
    prisma.slider.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, featured: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.event.findMany({
      where: { isActive: true, startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 3,
    }),
    prisma.siteSetting.findMany({
      where: {
        key: { in: ["instagramEnabled", "instagramToken", "instagramUsername"] },
      },
    }),
  ])

  const settingsMap: Record<string, string> = {}
  siteSettingsList.forEach((s) => {
    settingsMap[s.key] = s.value
  })

  return (
    <>
      <HeroSlider slides={sliders} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-stone-800">Öne Çıkan Ürünler</h2>
          <p className="text-stone-500 mt-2">El yapımı seramiklerimizi keşfedin</p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-stone-400 py-16">Henüz ürün eklenmemiş.</p>
        )}

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 bg-stone-800 text-white px-6 py-3 rounded-md font-medium hover:bg-stone-700 transition-colors"
          >
            Tüm Ürünler
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="bg-bg-warm py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-stone-800 mb-6">Hakkımızda</h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mb-8" />
          <p className="text-stone-600 leading-relaxed text-lg">
            Çanakçı Seramik, Çanakkale&apos;nin zengin seramik geleneğini modern tasarımlarla
            buluşturuyor. Her bir parça, ustalarımızın elleriyle şekillendirilir ve binlerce
            yıllık Anadolu seramik kültürünün izlerini taşır. Doğal malzemeler ve geleneksel
            yöntemlerle ürettiğimiz seramikler, evinize sıcaklık ve zarafet katar.
          </p>
          <div className="mt-10">
            <Link
              href="/about"
              className="inline-flex items-center gap-1 text-stone-800 font-medium border-b-2 border-stone-300 hover:border-stone-800 pb-0.5 transition-colors"
            >
              Daha Fazla
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {upcomingEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-stone-800">Yaklaşan Etkinlikler</h2>
            <p className="text-stone-500 mt-2">Seramik atölyelerimize katılın</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group bg-white rounded-lg overflow-hidden border border-stone-200 hover:shadow-lg transition-shadow"
              >
                <div className="h-52 bg-stone-100 overflow-hidden">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                    {formatDate(event.startDate)}
                  </p>
                  <h3 className="font-semibold text-stone-800 mt-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-sm text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/events"
              className="inline-flex items-center gap-1 text-stone-800 font-medium border-b-2 border-stone-300 hover:border-stone-800 pb-0.5 transition-colors"
            >
              Tüm Etkinlikler
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      <InstagramFeed
        username={settingsMap.instagramUsername || ""}
        token={settingsMap.instagramToken || ""}
        enabled={settingsMap.instagramEnabled === "true"}
      />
    </>
  )
}
