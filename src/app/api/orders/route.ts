import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateOrderNumber } from "@/lib/utils"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || ""
  const search = searchParams.get("search") || ""

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { customerName, customerEmail, customerPhone, customerAddress, city, district, notes, items, paymentMethod } = body

    if (!customerName || !customerEmail || !items?.length) {
      return NextResponse.json({ error: "Müşteri bilgileri ve ürünler zorunludur." }, { status: 400 })
    }

    const totalAmount = items.reduce((sum: number, item: { price: number; quantity: number }) => 
      sum + item.price * item.quantity, 0
    )

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        city,
        district,
        notes,
        paymentMethod,
        totalAmount,
        items: {
          create: items.map((item: { productName: string; productImage?: string; price: number; quantity: number; productId?: string }) => ({
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
            productId: item.productId || null,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Order create error:", error)
    return NextResponse.json({ error: "Sipariş oluşturulamadı." }, { status: 500 })
  }
}
