import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt-ts"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, address: true, addressCity: true, addressDistrict: true },
  })

  return NextResponse.json({ success: true, user })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
  }

  try {
    const body = await req.json()

    if (body.password) {
      const hashedPassword = await hash(body.password, 10)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      })
      return NextResponse.json({ success: true, message: "Şifre başarıyla güncellendi" })
    }

    const data: Record<string, string | null> = {}
    if (body.name !== undefined) data.name = body.name || null
    if (body.phone !== undefined) data.phone = body.phone || null
    if (body.email !== undefined && body.email) data.email = body.email
    if (body.address !== undefined) data.address = body.address || null
    if (body.addressCity !== undefined) data.addressCity = body.addressCity || null
    if (body.addressDistrict !== undefined) data.addressDistrict = body.addressDistrict || null

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: "Güncellenecek alan bulunamadı" }, { status: 400 })
    }

    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } })
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ success: false, error: "Bu e-posta adresi zaten kullanılıyor" }, { status: 400 })
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
    })

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, addressCity: user.addressCity, addressDistrict: user.addressDistrict } })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ success: false, error: "Profil güncellenirken bir hata oluştu" }, { status: 500 })
  }
}
