import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const events = await prisma.event.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { registrations: true } } },
  })

  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, description, image, startDate, endDate, time, location, price, capacity, isActive } = body

    if (!title || !startDate) {
      return NextResponse.json({ error: "Başlık ve başlangıç tarihi zorunludur." }, { status: 400 })
    }

    let slug = slugify(title)
    const existing = await prisma.event.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }
    const event = await prisma.event.create({
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

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Event create error:", error)
    return NextResponse.json({ error: "Etkinlik oluşturulamadı." }, { status: 500 })
  }
}
