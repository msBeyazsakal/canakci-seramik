import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
  }

  const { id } = await params

  const registration = await prisma.eventRegistration.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { email: session.user.email },
      ],
    },
    include: {
      event: true,
      user: { select: { name: true, email: true } },
    },
  })

  if (!registration) {
    return NextResponse.json({ success: false, error: "Kayıt bulunamadı" }, { status: 404 })
  }

  return NextResponse.json({ success: true, registration })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
  }

  const { id } = await params

  const registration = await prisma.eventRegistration.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { email: session.user.email },
      ],
    },
  })

  if (!registration) {
    return NextResponse.json({ success: false, error: "Kayıt bulunamadı" }, { status: 404 })
  }

  await prisma.eventRegistration.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
