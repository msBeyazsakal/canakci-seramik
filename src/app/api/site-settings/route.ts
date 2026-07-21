import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const settings = await prisma.siteSetting.findMany()
  const result: Record<string, string> = {}
  settings.forEach((s) => {
    result[s.key] = s.value
  })

  return NextResponse.json(result)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    const upserted = await Promise.all(
      Object.entries(body).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    )

    const result: Record<string, string> = {}
    upserted.forEach((s) => {
      result[s.key] = s.value
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Ayarlar güncellenemedi." }, { status: 500 })
  }
}
