import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await prisma.event.findUnique({
    where: { slug, isActive: true },
    include: { _count: { select: { registrations: true } } },
  })

  if (!event) {
    return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 })
  }

  return NextResponse.json(event)
}
