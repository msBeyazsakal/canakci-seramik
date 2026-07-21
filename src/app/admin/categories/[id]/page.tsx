import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import CategoryForm from "../CategoryForm"

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Kategori Düzenle</h1>
      <CategoryForm
        initialData={{
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          order: category.order,
          isActive: category.isActive,
        }}
      />
    </div>
  )
}
