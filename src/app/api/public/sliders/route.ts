import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const sliders = await prisma.slider.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  })

  return NextResponse.json(sliders)
}
