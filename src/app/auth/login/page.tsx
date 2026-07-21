"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("E-posta veya şifre hatalı.")
      setLoading(false)
      return
    }

    const sessionRes = await fetch("/api/auth/session")
    const session = await sessionRes.json()
    window.location.href = session?.user?.role === "ADMIN" ? "/admin" : "/panel"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-stone-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-stone-800">Çanakçı Seramik</h1>
            <p className="text-stone-500 mt-1">Giriş Yap</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-posta"
              name="email"
              type="email"
              required
              placeholder="E-posta adresiniz"
            />
            <Input
              label="Şifre"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Hesabınız yok mu?{" "}
            <Link href="/auth/register" className="text-amber-700 font-medium hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
