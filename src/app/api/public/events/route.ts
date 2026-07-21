import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
    include: { _count: { select: { registrations: true } } },
  })

  return NextResponse.json(events)
}
