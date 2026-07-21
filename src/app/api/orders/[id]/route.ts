import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  })

  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { status, paymentStatus, notes, customerAddress, city, district, customerPhone } = body

    const data: Record<string, unknown> = {}
    if (status) data.status = status
    if (paymentStatus) data.paymentStatus = paymentStatus
    if (notes !== undefined) data.notes = notes
    if (customerAddress !== undefined) data.customerAddress = customerAddress
    if (city !== undefined) data.city = city
    if (district !== undefined) data.district = district
    if (customerPhone !== undefined) data.customerPhone = customerPhone

    const order = await prisma.order.update({
      where: { id },
      data,
      include: { items: true, user: { select: { name: true, email: true } } },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Order update error:", error)
    return NextResponse.json({ error: "Sipariş güncellenemedi." }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.order.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Order delete error:", error)
    return NextResponse.json({ error: "Sipariş silinemedi." }, { status: 500 })
  }
}
