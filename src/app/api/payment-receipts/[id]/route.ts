import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { status } = body

    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 })
    }

    const receipt = await prisma.paymentReceipt.update({
      where: { id },
      data: { status },
    })

    if (status === "VERIFIED") {
      if (receipt.orderId) {
        await prisma.order.update({
          where: { id: receipt.orderId },
          data: { paymentStatus: "PAID" },
        })
      }
    }

    await prisma.notification.create({
      data: {
        type: "PAYMENT_RECEIPT_STATUS",
        title: status === "VERIFIED" ? "Dekont Onaylandı" : "Dekont Reddedildi",
        message: status === "VERIFIED"
          ? "Yüklediğiniz dekont onaylanmıştır."
          : "Yüklediğiniz dekont reddedilmiştir. Lütfen iletişime geçiniz.",
        link: receipt.orderId ? `/admin/orders/${receipt.orderId}` : "/admin/events",
      },
    })

    return NextResponse.json({ success: true, receipt })
  } catch (error) {
    console.error("Receipt update error:", error)
    return NextResponse.json({ error: "Dekont güncellenemedi" }, { status: 500 })
  }
}
