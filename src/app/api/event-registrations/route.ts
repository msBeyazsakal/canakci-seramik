import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get("eventId") || ""

  const where: Record<string, unknown> = {}
  if (eventId) where.eventId = eventId

  // Admin: tüm kayıtları görür; Customer: sadece kendi email'iyle eşleşenleri
  if (session.user.role !== "ADMIN") {
    where.OR = [
      { userId: session.user.id },
      { email: session.user.email },
    ]
  }

  const registrations = await prisma.eventRegistration.findMany({
    where,
    include: { event: { select: { title: true, slug: true, startDate: true, location: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ success: true, registrations })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID gerekli." }, { status: 400 })
    }

    // Sadece kendi kaydını silebilir (admin her kaydı silebilir)
    const reg = await prisma.eventRegistration.findUnique({ where: { id } })
    if (!reg) {
      return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 })
    }
    if (session.user.role !== "ADMIN" && reg.email !== session.user.email && reg.userId !== session.user.id) {
      return NextResponse.json({ error: "Bu kaydı silme yetkiniz yok." }, { status: 403 })
    }

    await prisma.eventRegistration.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Registration delete error:", error)
    return NextResponse.json({ error: "Kayıt silinemedi." }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, paymentStatus } = body
    if (!id) {
      return NextResponse.json({ error: "ID gerekli." }, { status: 400 })
    }

    const data: Record<string, string | null> = {}
    if (paymentStatus) data.paymentStatus = paymentStatus

    await prisma.eventRegistration.update({ where: { id }, data })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Registration update error:", error)
    return NextResponse.json({ error: "Kayıt güncellenemedi." }, { status: 500 })
  }
}
