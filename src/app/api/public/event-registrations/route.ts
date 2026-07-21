import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { eventId, name, email, phone, message, participantCount, userId } = body

    if (!eventId || !name || !email) {
      return NextResponse.json({ error: "Etkinlik, isim ve e-posta zorunludur." }, { status: 400 })
    }

    const event = await prisma.event.findUnique({ where: { id: eventId, isActive: true } })
    if (!event) {
      return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 })
    }

    if (event.capacity > 0) {
      const registrationCount = await prisma.eventRegistration.count({
        where: { eventId },
      })
      const count = participantCount || 1
      if (registrationCount + count > event.capacity) {
        return NextResponse.json({ error: "Etkinlik kontenjanı dolu." }, { status: 400 })
      }
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        name,
        email,
        phone,
        message,
        participantCount: participantCount || 1,
        userId: userId || null,
        paymentAmount: event.price > 0 ? event.price * (participantCount || 1) : null,
      },
    })

    await prisma.notification.create({
      data: {
        type: "NEW_EVENT_REGISTRATION",
        title: "Yeni Etkinlik Kaydı",
        message: `${name} (${email}) - ${event.title} etkinliğine kaydoldu.`,
        link: `/admin/events`,
      },
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error("Registration create error:", error)
    return NextResponse.json({ error: "Kayıt oluşturulamadı." }, { status: 500 })
  }
}
