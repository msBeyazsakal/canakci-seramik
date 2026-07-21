import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids")
  if (!ids) {
    return NextResponse.json({ success: false, error: "Ürün ID'leri gerekli" }, { status: 400 })
  }

  const productIds = ids.split(",").filter(Boolean)

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, name: true, price: true, images: true, stock: true },
  })

  return NextResponse.json({ success: true, products })
}
