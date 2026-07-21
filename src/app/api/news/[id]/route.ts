import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const newsItem = await prisma.news.findUnique({ where: { id } })

  if (!newsItem) {
    return NextResponse.json({ error: "Haber bulunamadı." }, { status: 404 })
  }

  return NextResponse.json(newsItem)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { title, content, excerpt, image, source, sourceUrl, isActive } = body

    if (!title) {
      return NextResponse.json({ error: "Başlık zorunludur." }, { status: 400 })
    }

    const slug = slugify(title)
    const newsItem = await prisma.news.update({
      where: { id },
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

    return NextResponse.json(newsItem)
  } catch (error) {
    console.error("News update error:", error)
    return NextResponse.json({ error: "Haber güncellenemedi." }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.news.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("News delete error:", error)
    return NextResponse.json({ error: "Haber silinemedi." }, { status: 500 })
  }
}
