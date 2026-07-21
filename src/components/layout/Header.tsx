"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import CartBadge from "@/components/ui/CartBadge"

const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/products", label: "Ürünler" },
  { href: "/events", label: "Etkinlikler" },
  { href: "/news", label: "Medya" },
  { href: "/about", label: "Hakkımızda" },
  { href: "/contact", label: "İletişim" },
  { href: "/track", label: "Sipariş Takip" },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-semibold text-stone-800 tracking-tight">
            Çanakçı Seramik
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Sepet
              <CartBadge />
            </Link>
            {session ? (
              <div className="flex items-center gap-3">
                {session.user.role === "ADMIN" ? (
                  <Link href="/admin" className="text-sm text-stone-600 hover:text-stone-900">
                    Yönetim
                  </Link>
                ) : (
                  <Link href="/panel" className="text-sm text-stone-600 hover:text-stone-900">
                    Panelim
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-sm text-stone-500 hover:text-stone-700"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/register"
                  className="text-sm text-stone-600 hover:text-stone-900 transition-colors px-3 py-2"
                >
                  Kayıt Ol
                </Link>
                <Link
                  href="/auth/login"
                  className="text-sm bg-stone-800 text-white px-4 py-2 rounded-md hover:bg-stone-700 transition-colors"
                >
                  Giriş Yap
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden p-3 -mr-2 text-stone-600 active:bg-stone-100 rounded-lg touch-manipulation"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü"
          >
            <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/20 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <nav className="md:hidden relative z-50 pb-4 space-y-2 bg-white">
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-2 py-2 text-sm text-stone-600 hover:text-stone-900"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span>Sepet</span>
              <CartBadge />
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-2 py-2 text-sm text-stone-600 hover:text-stone-900"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link
                  href={session.user.role === "ADMIN" ? "/admin" : "/panel"}
                  className="block px-2 py-2 text-sm text-stone-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Panelim
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block px-2 py-2 text-sm text-stone-500"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="block px-2 py-2 text-sm text-stone-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Kayıt Ol
                </Link>
                <Link
                  href="/auth/login"
                  className="block px-2 py-2 text-sm text-stone-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
              </>
            )}
          </nav>
          </>
        )}
      </div>
    </header>
  )
}
