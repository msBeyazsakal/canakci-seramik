import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  })

  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { name, slug, description, price, comparePrice, stock, images, categoryId, featured, isActive } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: "İsim ve fiyat zorunludur." }, { status: 400 })
    }

    const productSlug = slug || slugify(name)

    const existing = await prisma.product.findFirst({
      where: { slug: productSlug, NOT: { id } },
    })
    if (existing) {
      return NextResponse.json({ error: "Bu slug ile başka bir ürün mevcut." }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id },
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

    return NextResponse.json(product)
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json({ error: "Ürün güncellenemedi." }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Product delete error:", error)
    return NextResponse.json({ error: "Ürün silinemedi." }, { status: 500 })
  }
}
