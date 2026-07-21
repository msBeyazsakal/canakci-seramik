import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  })

  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 })
  }

  return NextResponse.json(product)
}
