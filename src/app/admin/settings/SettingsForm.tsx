"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import ImageUpload from "@/components/ui/ImageUpload"

interface SettingsFormProps {
  initialData: Record<string, string>
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    siteTitle: initialData.siteTitle || "",
    siteDescription: initialData.siteDescription || "",
    logoUrl: initialData.logoUrl || "",
    aboutContent: initialData.aboutContent || "",
    contactEmail: initialData.contactEmail || "",
    contactPhone: initialData.contactPhone || "",
    contactAddress: initialData.contactAddress || "",
    workingHours: initialData.workingHours || "",
    facebookUrl: initialData.facebookUrl || "",
    instagramUrl: initialData.instagramUrl || "",
    twitterUrl: initialData.twitterUrl || "",
    instagramEnabled: initialData.instagramEnabled || "false",
    instagramToken: initialData.instagramToken || "",
    instagramUsername: initialData.instagramUsername || "",
    youtubeUrl: initialData.youtubeUrl || "",
    whatsappNumber: initialData.whatsappNumber || "",
    bankName: initialData.bankName || "",
    bankBranch: initialData.bankBranch || "",
    bankAccountName: initialData.bankAccountName || "",
    bankIban: initialData.bankIban || "",
    bankAccountNo: initialData.bankAccountNo || "",
    footerText: initialData.footerText || "",
  })

  function updateField(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Bir hata oluştu.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 border-b border-stone-200 pb-2">Genel</h2>
        <Input label="Site Başlığı" value={formData.siteTitle} onChange={(e) => updateField("siteTitle", e.target.value)} />
        <Textarea label="Site Açıklaması" value={formData.siteDescription} onChange={(e) => updateField("siteDescription", e.target.value)} rows={2} />
        <ImageUpload label="Logo" value={formData.logoUrl} onChange={(url) => updateField("logoUrl", url as string)} />
        <Textarea label="Hakkımızda İçeriği" value={formData.aboutContent} onChange={(e) => updateField("aboutContent", e.target.value)} rows={5} />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 border-b border-stone-200 pb-2">İletişim</h2>
        <Input label="E-posta" value={formData.contactEmail} onChange={(e) => updateField("contactEmail", e.target.value)} />
        <Input label="Telefon" value={formData.contactPhone} onChange={(e) => updateField("contactPhone", e.target.value)} />
        <Textarea label="Adres" value={formData.contactAddress} onChange={(e) => updateField("contactAddress", e.target.value)} rows={2} />
        <Input label="Çalışma Saatleri" value={formData.workingHours} onChange={(e) => updateField("workingHours", e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 border-b border-stone-200 pb-2">Sosyal Medya</h2>
        <Input label="Facebook URL" value={formData.facebookUrl} onChange={(e) => updateField("facebookUrl", e.target.value)} />
        <Input label="Instagram URL" value={formData.instagramUrl} onChange={(e) => updateField("instagramUrl", e.target.value)} />
        <Input label="Twitter URL" value={formData.twitterUrl} onChange={(e) => updateField("twitterUrl", e.target.value)} />
        <Input label="YouTube URL" value={formData.youtubeUrl} onChange={(e) => updateField("youtubeUrl", e.target.value)} />
        <Input label="WhatsApp Numarası" value={formData.whatsappNumber} onChange={(e) => updateField("whatsappNumber", e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 border-b border-stone-200 pb-2">Instagram Entegrasyonu</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={formData.instagramEnabled === "true"}
            onClick={() =>
              updateField("instagramEnabled", formData.instagramEnabled === "true" ? "false" : "true")
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.instagramEnabled === "true" ? "bg-stone-800" : "bg-stone-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.instagramEnabled === "true" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-stone-700">Instagram Feed&apos;i Göster</span>
        </div>
        <Input
          label="Instagram Kullanıcı Adı"
          value={formData.instagramUsername}
          onChange={(e) => updateField("instagramUsername", e.target.value)}
          placeholder="kullanici_adiniz"
        />
        <Input
          label="Erişim Token'ı"
          value={formData.instagramToken}
          onChange={(e) => updateField("instagramToken", e.target.value)}
        />
        <p className="text-xs text-stone-400">
          Instagram Basic Display API için geçerli bir token girin. Token almak için Instagram Developer portalını kullanın.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 border-b border-stone-200 pb-2">Banka Bilgileri (EFT/HAVALE)</h2>
        <Input label="Banka Adı" value={formData.bankName} onChange={(e) => updateField("bankName", e.target.value)} />
        <Input label="Şube" value={formData.bankBranch} onChange={(e) => updateField("bankBranch", e.target.value)} />
        <Input label="Alıcı Adı" value={formData.bankAccountName} onChange={(e) => updateField("bankAccountName", e.target.value)} />
        <Input label="IBAN" value={formData.bankIban} onChange={(e) => updateField("bankIban", e.target.value)} />
        <Input label="Hesap No" value={formData.bankAccountNo} onChange={(e) => updateField("bankAccountNo", e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-semibold text-stone-800 border-b border-stone-200 pb-2">Footer</h2>
        <Textarea label="Footer Metni" value={formData.footerText} onChange={(e) => updateField("footerText", e.target.value)} rows={2} />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </Button>
      </div>
    </form>
  )
}
