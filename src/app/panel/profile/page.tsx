"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

export default function ProfilePage() {
  const { data: session, update } = useSession()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [addressCity, setAddressCity] = useState("")
  const [addressDistrict, setAddressDistrict] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
    }
    fetchUserProfile()
  }, [session])

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/profile")
      const data = await res.json()
      if (data.success && data.user) {
        setName(data.user.name || "")
        setEmail(data.user.email || "")
        setPhone(data.user.phone || "")
        setAddress(data.user.address || "")
        setAddressCity(data.user.addressCity || "")
        setAddressDistrict(data.user.addressDistrict || "")
      }
    } catch {
      // ignore
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, address, addressCity, addressDistrict }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: "success", text: "Profil başarıyla güncellendi" })
        update()
      } else {
        setMessage({ type: "error", text: data.error || "Güncelleme başarısız" })
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata oluştu" })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirm) {
      setMessage({ type: "error", text: "Şifreler eşleşmiyor" })
      return
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Şifre en az 6 karakter olmalıdır" })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: "success", text: "Şifre başarıyla güncellendi" })
        setPassword("")
        setPasswordConfirm("")
      } else {
        setMessage({ type: "error", text: data.error || "Güncelleme başarısız" })
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata oluştu" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-2xl font-semibold text-stone-800">Profil</h2>
        <p className="text-stone-500 mt-1">Kişisel bilgilerinizi ve şifrenizi güncelleyin.</p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleProfileUpdate} className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h3 className="font-semibold text-stone-800">Kişisel Bilgiler</h3>
        <Input label="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Telefon" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="5XX XXX XX XX" />
        <Input label="Adres" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adres bilginizi girin" />
        <Input label="Şehir" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="Şehir" />
        <Input label="İlçe" value={addressDistrict} onChange={(e) => setAddressDistrict(e.target.value)} placeholder="İlçe" />
        <Button type="submit" disabled={saving}>
          {saving ? "Kaydediliyor..." : "Bilgileri Kaydet"}
        </Button>
      </form>

      <form onSubmit={handlePasswordUpdate} className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h3 className="font-semibold text-stone-800">Şifre Değiştir</h3>
        <Input
          label="Yeni Şifre"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="En az 6 karakter"
        />
        <Input
          label="Yeni Şifre Tekrar"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="Şifrenizi tekrar girin"
        />
        <Button type="submit" disabled={saving || !password || !passwordConfirm}>
          {saving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </Button>
      </form>
    </div>
  )
}
