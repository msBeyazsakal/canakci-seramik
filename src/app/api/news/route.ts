import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const news = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(news)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, content, excerpt, image, source, sourceUrl, isActive } = body

    if (!title) {
      return NextResponse.json({ error: "Başlık zorunludur." }, { status: 400 })
    }

    const slug = slugify(title)
    const newsItem = await prisma.news.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        image,
        source,
        sourceUrl,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(newsItem, { status: 201 })
  } catch (error) {
    console.error("News create error:", error)
    return NextResponse.json({ error: "Haber oluşturulamadı." }, { status: 500 })
  }
}
