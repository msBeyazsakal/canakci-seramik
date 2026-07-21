import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const slider = await prisma.slider.findUnique({ where: { id } })

  if (!slider) {
    return NextResponse.json({ error: "Slider bulunamadı." }, { status: 404 })
  }

  return NextResponse.json(slider)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { title, subtitle, image, link, order, isActive } = body

    if (!image) {
      return NextResponse.json({ error: "Görsel zorunludur." }, { status: 400 })
    }

    const slider = await prisma.slider.update({
      where: { id },
      data: {
        title,
        subtitle,
        image,
        link,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(slider)
  } catch (error) {
    console.error("Slider update error:", error)
    return NextResponse.json({ error: "Slider güncellenemedi." }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.slider.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Slider delete error:", error)
    return NextResponse.json({ error: "Slider silinemedi." }, { status: 500 })
  }
}
