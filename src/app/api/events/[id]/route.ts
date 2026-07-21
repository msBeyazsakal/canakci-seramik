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
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: true } } },
  })

  if (!event) {
    return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 })
  }

  return NextResponse.json(event)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { title, description, image, startDate, endDate, time, location, price, capacity, isActive } = body

    if (!title || !startDate) {
      return NextResponse.json({ error: "Başlık ve başlangıç tarihi zorunludur." }, { status: 400 })
    }

    let slug = slugify(title)
    const slugExists = await prisma.event.findFirst({ where: { slug, NOT: { id } } })
    if (slugExists) {
      slug = `${slug}-${Date.now()}`
    }
    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        image,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        time,
        location,
        price: price ? parseFloat(price) : 0,
        capacity: capacity ? parseInt(capacity) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Event update error:", error)
    return NextResponse.json({ error: "Etkinlik güncellenemedi." }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.event.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Event delete error:", error)
    return NextResponse.json({ error: "Etkinlik silinemedi." }, { status: 500 })
  }
}
