import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sanitizeText } from "@/lib/security"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = sanitizeText(body.name, 100)
    const email = (body.email || "").trim().toLowerCase()
    const phone = body.phone || ""
    const subject = sanitizeText(body.subject, 200)
    const message = sanitizeText(body.message, 5000)

    if (!name || !email || !message) {
      return NextResponse.json({ error: "İsim, e-posta ve mesaj zorunludur." }, { status: 400 })
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, phone, subject, message },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("Contact create error:", error)
    return NextResponse.json({ error: "Mesaj gönderilemedi." }, { status: 500 })
  }
}
