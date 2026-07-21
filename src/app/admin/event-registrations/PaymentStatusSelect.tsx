"use client"

import { useState } from "react"

const statuses = [
  { value: "PENDING", label: "Bekliyor" },
  { value: "PAID", label: "Ödendi" },
  { value: "REFUNDED", label: "İade Edildi" },
  { value: "CANCELLED", label: "İptal" },
]

export default function PaymentStatusSelect({
  registrationId,
  currentStatus,
}: {
  registrationId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setSaving(true)
    try {
      const res = await fetch("/api/event-registrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: registrationId, paymentStatus: newStatus }),
      })
      const data = await res.json()
      if (data.success) setStatus(newStatus)
    } catch {
      // revert on error
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className={`text-xs px-2 py-1 rounded border ${
        saving ? "opacity-50" : ""
      } border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20`}
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}
