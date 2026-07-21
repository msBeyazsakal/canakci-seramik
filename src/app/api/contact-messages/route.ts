import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const isRead = searchParams.get("isRead")

  const where: Record<string, unknown> = {}
  if (isRead === "true") where.isRead = true
  if (isRead === "false") where.isRead = false

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(messages)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const body = await req.json()

    if (!id) {
      return NextResponse.json({ error: "ID gerekli." }, { status: 400 })
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: body.isRead },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Message update error:", error)
    return NextResponse.json({ error: "Mesaj güncellenemedi." }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID gerekli." }, { status: 400 })
    }

    await prisma.contactMessage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Message delete error:", error)
    return NextResponse.json({ error: "Mesaj silinemedi." }, { status: 500 })
  }
}
