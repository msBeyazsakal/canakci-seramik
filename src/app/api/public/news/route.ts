import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const news = await prisma.news.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json(news)
}
