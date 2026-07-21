import { prisma } from "@/lib/prisma"
import ProductForm from "../ProductForm"

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Yeni Ürün</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
