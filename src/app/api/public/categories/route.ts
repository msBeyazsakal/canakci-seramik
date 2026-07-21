import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  })

  return NextResponse.json(categories)
}
