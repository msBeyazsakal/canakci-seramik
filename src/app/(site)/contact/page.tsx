import { prisma } from "@/lib/prisma"
import ContactForm from "@/components/ui/ContactForm"

export default async function ContactPage() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["contact_email", "contact_phone", "contact_address"] } },
  })

  const contactInfo: Record<string, string> = {}
  settings.forEach((s) => {
    contactInfo[s.key] = s.value
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-semibold text-stone-800">İletişim</h1>
        <p className="text-stone-500 mt-1">Bizimle iletişime geçin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-10">
          <div>
            <h2 className="text-lg font-semibold text-stone-800 mb-6">
              İletişim Bilgileri
            </h2>
            <div className="space-y-5">
              {contactInfo["contact_email"] && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">E-posta</p>
                    <a
                      href={`mailto:${contactInfo["contact_email"]}`}
                      className="text-stone-800 hover:text-primary transition-colors"
                    >
                      {contactInfo["contact_email"]}
                    </a>
                  </div>
                </div>
              )}
              {contactInfo["contact_phone"] && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Telefon</p>
                    <a
                      href={`tel:${contactInfo["contact_phone"]}`}
                      className="text-stone-800 hover:text-primary transition-colors"
                    >
                      {contactInfo["contact_phone"]}
                    </a>
                  </div>
                </div>
              )}
              {contactInfo["contact_address"] && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Adres</p>
                    <p className="text-stone-800">{contactInfo["contact_address"]}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-64 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
            <div className="text-center">
              <svg
                className="w-10 h-10 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <p className="text-sm">Harita burada gösterilecek</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-6">Mesaj Gönder</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
