import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt-ts"
import { sanitizeText } from "@/lib/security"

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Ad, e-posta ve şifre zorunludur" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır" }, { status: 400 })
    }

    const sanitizedName = sanitizeText(name, 100)
    const sanitizedEmail = email.trim().toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: sanitizedEmail } })
    if (existing) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        phone: phone || null,
        role: "CUSTOMER",
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Kayıt oluşturulamadı" }, { status: 500 })
  }
}
