"use client"

import { useEffect, useState } from "react"
import { formatDate } from "@/lib/utils"

interface Receipt {
  id: string
  fileUrl: string
  fileName: string
  notes: string | null
  status: string
  createdAt: string
  orderId: string | null
  eventRegistrationId: string | null
  user: { name: string | null; email: string } | null
}

const statusLabels: Record<string, string> = {
  PENDING: "İnceleniyor",
  VERIFIED: "Onaylandı",
  REJECTED: "Reddedildi",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  VERIFIED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
}

export default function PaymentReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/payment-receipts")
      .then((r) => r.json())
      .then((data) => { if (data.success) setReceipts(data.receipts) })
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/payment-receipts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        setReceipts((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
      }
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-stone-800">Dekont Yönetimi</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 h-20" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-stone-800">Dekont Yönetimi</h2>
        <p className="text-stone-500 mt-1">Kullanıcılar tarafından yüklenen dekontları görüntüleyin ve onaylayın.</p>
      </div>

      {receipts.length > 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left px-5 py-3 font-medium text-stone-700">Kullanıcı</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-700">Dekont</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-700">İlişkili</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-700">Not</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-700">Tarih</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-700">Durum</th>
                  <th className="text-left px-5 py-3 font-medium text-stone-700">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-stone-50">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-stone-800">{receipt.user?.name || "Misafir"}</p>
                      <p className="text-xs text-stone-500">{receipt.user?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={receipt.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-700 hover:text-amber-800 font-medium"
                      >
                        {receipt.fileName}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-stone-600">
                      {receipt.orderId ? `Sipariş #${receipt.orderId.slice(-6)}` : "Etkinlik Kaydı"}
                    </td>
                    <td className="px-5 py-4 text-stone-600 max-w-[200px] truncate">
                      {receipt.notes || "-"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-stone-500 text-xs">
                      {formatDate(new Date(receipt.createdAt))}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[receipt.status] || ""}`}>
                        {statusLabels[receipt.status] || receipt.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {receipt.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatus(receipt.id, "VERIFIED")}
                            disabled={updating === receipt.id}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 disabled:opacity-50"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => handleStatus(receipt.id, "REJECTED")}
                            disabled={updating === receipt.id}
                            className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 disabled:opacity-50"
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-stone-500">Henüz dekont yüklenmemiş.</p>
        </div>
      )}
    </div>
  )
}
