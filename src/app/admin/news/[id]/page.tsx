import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import NewsForm from "../NewsForm"

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const newsItem = await prisma.news.findUnique({ where: { id } })
  if (!newsItem) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Haber Düzenle</h1>
      <NewsForm
        initialData={{
          id: newsItem.id,
          title: newsItem.title,
          content: newsItem.content,
          excerpt: newsItem.excerpt,
          image: newsItem.image,
          source: newsItem.source,
          sourceUrl: newsItem.sourceUrl,
          isActive: newsItem.isActive,
        }}
      />
    </div>
  )
}
