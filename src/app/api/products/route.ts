import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const categoryId = searchParams.get("categoryId") || ""

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ]
  }
  if (categoryId) {
    where.categoryId = categoryId
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, slug, description, price, comparePrice, stock, images, categoryId, featured, isActive } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: "İsim ve fiyat zorunludur." }, { status: 400 })
    }

    const productSlug = slug || slugify(name)

    const existing = await prisma.product.findUnique({ where: { slug: productSlug } })
    if (existing) {
      return NextResponse.json({ error: "Bu slug ile bir ürün zaten mevcut." }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: productSlug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock: stock ? parseInt(stock) : 0,
        images: images || [],
        categoryId: categoryId || null,
        featured: featured || false,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: { category: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Product create error:", error)
    return NextResponse.json({ error: "Ürün oluşturulamadı." }, { status: 500 })
  }
}
