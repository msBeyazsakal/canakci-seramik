import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default async function NewsPage() {
  const newsList = await prisma.news.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-semibold text-stone-800">Medya</h1>
        <p className="text-stone-500 mt-1">Haberler ve duyurular</p>
      </div>

      {newsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsList.map((item) => {
            const CardWrapper = item.sourceUrl
              ? ({ children }: { children: React.ReactNode }) => (
                  <a
                    href={item.sourceUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:shadow-lg transition-shadow block"
                  >
                    {children}
                  </a>
                )
              : ({ children }: { children: React.ReactNode }) => (
                  <div className="group bg-white rounded-xl overflow-hidden border border-stone-200">
                    {children}
                  </div>
                )

            return (
              <CardWrapper key={item.id}>
                <div className="h-52 bg-stone-100 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-stone-400 mb-2">{formatDate(item.createdAt)}</p>
                  <h3 className="font-semibold text-stone-800 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-sm text-stone-500 mt-2 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  )}
                  {item.source && (
                    <p className="text-xs text-stone-400 mt-3">Kaynak: {item.source}</p>
                  )}
                </div>
              </CardWrapper>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <svg
            className="w-16 h-16 mx-auto text-stone-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-stone-400">Henüz haber eklenmemiş.</p>
        </div>
      )}
    </div>
  )
}
