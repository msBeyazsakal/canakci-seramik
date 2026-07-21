import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { orderId, eventRegistrationId, fileUrl, fileName, notes } = body

    if (!fileUrl) {
      return NextResponse.json({ error: "Dekont dosyası gerekli" }, { status: 400 })
    }

    const receipt = await prisma.paymentReceipt.create({
      data: {
        userId: session.user.id,
        orderId: orderId || null,
        eventRegistrationId: eventRegistrationId || null,
        fileUrl,
        fileName: fileName || "dekont",
        notes: notes || null,
      },
    })

    const targetLabel = orderId ? `sipariş #${orderId.slice(-6)}` : "etkinlik kaydı"
    await prisma.notification.create({
      data: {
        type: "PAYMENT_RECEIPT",
        title: "Yeni Ödeme Bildirimi",
        message: `${session.user.name || session.user.email} kullanıcısı ${targetLabel} için dekont yükledi.`,
        link: orderId ? `/admin/orders/${orderId}` : `/admin/events`,
      },
    })

    return NextResponse.json({ success: true, receipt }, { status: 201 })
  } catch (error) {
    console.error("Payment notification error:", error)
    return NextResponse.json({ error: "Ödeme bildirimi gönderilemedi" }, { status: 500 })
  }
}
