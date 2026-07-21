import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get("unread") === "true"

  const where = unreadOnly ? { isRead: false } : {}

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const unreadCount = await prisma.notification.count({
    where: { isRead: false },
  })

  return NextResponse.json({ success: true, notifications, unreadCount })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id } = body

    if (id) {
      await prisma.notification.update({ where: { id }, data: { isRead: true } })
    } else {
      await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification update error:", error)
    return NextResponse.json({ error: "Bildirim güncellenemedi" }, { status: 500 })
  }
}
