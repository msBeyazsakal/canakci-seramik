"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"

interface Receipt {
  id: string
  fileUrl: string
  fileName: string
  notes: string | null
  status: string
  createdAt: string
}

export default function PaymentReceiptUpload({
  orderId,
  eventRegistrationId,
  existingReceipts,
}: {
  orderId?: string
  eventRegistrationId?: string
  existingReceipts?: Receipt[]
}) {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  const [receipts, setReceipts] = useState<Receipt[]>(existingReceipts || [])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const receiptStatusLabels: Record<string, string> = {
    PENDING: "İnceleniyor",
    VERIFIED: "Onaylandı",
    REJECTED: "Reddedildi",
  }

  const receiptStatusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    VERIFIED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Lütfen bir dosya seçin" })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()

      if (!uploadData.success) {
        setMessage({ type: "error", text: uploadData.error || "Dosya yüklenemedi" })
        setUploading(false)
        return
      }

      const res = await fetch("/api/payment-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          eventRegistrationId,
          fileUrl: uploadData.url,
          fileName: file.name,
          notes: notes || undefined,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setReceipts((prev) => [data.receipt, ...prev])
        setFile(null)
        setNotes("")
        if (fileInputRef.current) fileInputRef.current.value = ""
        setMessage({ type: "success", text: "Dekont başarıyla yüklendi. Yönetici tarafından incelenecektir." })
      } else {
        setMessage({ type: "error", text: data.error || "Gönderilemedi" })
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata oluştu" })
    } finally {
      setUploading(false)
    }
  }

  if (!session?.user) return null

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-stone-800">Dekont Yükle</h3>

      {message && (
        <div className={`text-sm p-3 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Dekont (PDF veya Görsel)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Not (isteğe bağlı)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Havale tarihi, saat vb."
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="bg-amber-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-amber-800 disabled:opacity-50 transition-colors"
        >
          {uploading ? "Yükleniyor..." : "Dekontu Gönder"}
        </button>
      </div>

      {receipts.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-medium text-stone-700">Yüklenen Dekontlar</h4>
          {receipts.map((receipt) => (
            <div key={receipt.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-stone-200 flex items-center justify-center text-stone-500 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <a
                    href={receipt.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-amber-700 hover:text-amber-800"
                  >
                    {receipt.fileName}
                  </a>
                  {receipt.notes && (
                    <p className="text-xs text-stone-500 mt-0.5">{receipt.notes}</p>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${receiptStatusColors[receipt.status] || ""}`}>
                {receiptStatusLabels[receipt.status] || receipt.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
