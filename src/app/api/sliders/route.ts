import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sliders = await prisma.slider.findMany({
    orderBy: { order: "asc" },
  })

  return NextResponse.json(sliders)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, subtitle, image, link, order, isActive } = body

    if (!image) {
      return NextResponse.json({ error: "Görsel zorunludur." }, { status: 400 })
    }

    const maxOrder = await prisma.slider.aggregate({ _max: { order: true } })
    const slider = await prisma.slider.create({
      data: {
        title,
        subtitle,
        image,
        link,
        order: order ?? (maxOrder._max.order ?? 0) + 1,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(slider, { status: 201 })
  } catch (error) {
    console.error("Slider create error:", error)
    return NextResponse.json({ error: "Slider oluşturulamadı." }, { status: 500 })
  }
}
