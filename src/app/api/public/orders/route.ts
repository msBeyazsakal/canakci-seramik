import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOrderNumber, formatPrice } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, customerName, customerEmail, customerPhone, customerAddress, city, district, notes, userId } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "En az bir ürün gereklidir" }, { status: 400 })
    }
    if (!customerName || !customerEmail) {
      return NextResponse.json({ success: false, error: "Ad ve e-posta zorunludur" }, { status: 400 })
    }
    if (!customerPhone) {
      return NextResponse.json({ success: false, error: "Telefon zorunludur" }, { status: 400 })
    }
    if (!customerAddress) {
      return NextResponse.json({ success: false, error: "Adres zorunludur" }, { status: 400 })
    }
    if (!city) {
      return NextResponse.json({ success: false, error: "Şehir zorunludur" }, { status: 400 })
    }
    if (!district) {
      return NextResponse.json({ success: false, error: "İlçe zorunludur" }, { status: 400 })
    }

    const productIds = items.map((i: { productId: string }) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({ success: false, error: "Bazı ürünler bulunamadı" }, { status: 400 })
    }

    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) continue
      if (product.stock > 0 && product.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          error: `${product.name} için yeterli stok bulunmamaktadır. Mevcut stok: ${product.stock}`,
        }, { status: 400 })
      }
    }

    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId)!
      return {
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || null,
        price: product.price,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      }
    })

    const totalAmount = orderItems.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0)
    const orderNumber = generateOrderNumber()

    let validUserId = userId || null
    if (validUserId) {
      const user = await prisma.user.findUnique({ where: { id: validUserId }, select: { id: true } })
      if (!user) validUserId = null
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: validUserId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        customerAddress: customerAddress || null,
        city: city || null,
        district: district || null,
        notes: notes || null,
        status: "PENDING",
        paymentMethod: "HAVALE_EFT",
        paymentStatus: "PENDING",
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    })

    if (products.some((p) => p.stock > 0)) {
      for (const item of items) {
        const product = productMap.get(item.productId)
        if (product && product.stock > 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }
    }

    await prisma.notification.create({
      data: {
        type: "NEW_ORDER",
        title: "Yeni Sipariş",
        message: `${customerName} (${customerEmail}) tarafından ${formatPrice(totalAmount)} tutarında sipariş verildi.`,
        link: `/admin/orders/${order.id}`,
      },
    })

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ success: false, error: "Sipariş oluşturulurken bir hata oluştu" }, { status: 500 })
  }
}
