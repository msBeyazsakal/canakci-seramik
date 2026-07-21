import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { validateFile } from "@/lib/security"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 })
    }

    const validationError = validateFile(file)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const mimeType = file.type || "application/octet-stream"
    const dataUrl = `data:${mimeType};base64,${base64}`

    const receipt = await prisma.paymentReceipt.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileUrl: dataUrl,
        status: "PENDING",
      },
    })

    return NextResponse.json({ success: true, url: dataUrl, id: receipt.id })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Dosya yüklenemedi" }, { status: 500 })
  }
}
