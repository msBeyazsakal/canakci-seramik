import { prisma } from "@/lib/prisma"

export default async function AboutPage() {
  const aboutContent = await prisma.siteSetting.findUnique({
    where: { key: "about_content" },
  })

  const aboutText =
    aboutContent?.value ??
    `Çanakçı Seramik, Çanakkale'nin zengin seramik geleneğini modern tasarımlarla buluşturan bir aile işletmesidir.

Toprağın bu büyülü yolculuğuna ortak olmak için 2010 yılında yola çıktık. Geleneksel çömlekçi tornasında şekillendirdiğimiz her parça, binlerce yıllık Anadolu seramik kültürünün izlerini taşır.

Doğal kil ve sırlarla çalışıyor, her ürünü el işçiliğiyle özenle üretiyoruz. Tasarımlarımızda modern çizgilerle geleneksel motifleri harmanlıyoruz.

Atölyemizde düzenlediğimiz seramik atölyeleriyle bu kadim sanatı meraklılarıyla buluşturuyor, deneyimli eğitmenlerimiz eşliğinde katılımcıların kendi seramiklerini yapmalarına rehberlik ediyoruz.`

  return (
    <>
      <section className="bg-stone-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4">Hakkımızda</h1>
          <p className="text-stone-300 text-lg max-w-2xl mx-auto">
            Çanakkale&apos;nin seramik geleneğini modern tasarımlarla buluşturuyoruz
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="prose prose-stone max-w-none">
          {aboutText.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-stone-600 leading-relaxed text-lg mb-6">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-bg-warm py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-stone-800 text-center mb-12">
            Değerlerimiz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-800 mb-2">Geleneksel İşçilik</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Binlerce yıllık Anadolu seramik geleneğini yaşatıyor, her parçayı el işçiliğiyle özenle üretiyoruz.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-800 mb-2">Doğal Malzemeler</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Yalnızca doğal kil ve sırlar kullanıyor, çevreye duyarlı üretim yöntemlerini benimsiyoruz.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-800 mb-2">Tutku</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Seramik sanatına olan tutkumuzla her gün daha iyisini yapmak için çalışıyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
