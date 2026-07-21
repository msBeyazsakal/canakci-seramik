import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { hash } from "bcrypt-ts"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

function slugify(text: string): string {
  const tr: Record<string, string> = { ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", I: "I", İ: "I", ö: "o", Ö: "O", ş: "s", Ş: "S", ü: "u", Ü: "U" }
  return text.split("").map((c) => tr[c] || c).join("").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

const img = (lock: number, tag = "pottery") => `https://loremflickr.com/800/800/ceramic,${tag}?lock=${lock}`
const imgWide = (lock: number) => `https://loremflickr.com/1600/600/ceramic,pottery,workshop?lock=${lock}`

const categories = [
  {
    name: "Vazolar",
    description: "El yapımı seramik vazolar, her evin dekorasyonuna sıcaklık katar. Farklı boyut ve renk seçenekleriyle beğeninize sunuluyor.",
    image: img(1, "vase"),
    order: 1,
    products: [
      { name: "Klasik Toprak Vazo", price: 450, desc: "Geleneksel çömlekçi tornasında şekillendirilmiş, doğal toprak renginde vazo." },
      { name: "Mavi Çini Desenli Vazo", price: 680, desc: "Çanakkale seramiğinin eşsiz mavi desenleriyle süslenmiş vazo." },
      { name: "Modern Minimalist Vazo", price: 350, desc: "Sade ve şık çizgilerle tasarlanmış, mat beyaz seramik vazo." },
      { name: "Büyük Boy Dekoratif Vazo", price: 890, desc: "Salon ve antreler için 40 cm yüksekliğinde dekoratif vazo." },
      { name: "Rustik Kahverengi Vazo Seti", price: 520, desc: "3 farklı boyda rustik görünümlü vazo seti, el yapımı." },
      { name: "Sırlı Yeşil Vazo", price: 480, desc: "Akik yeşili sırla kaplanmış, zarif hatlı seramik vazo." },
      { name: "Çizgili Dekor Vazo", price: 390, desc: "Yatay çizgili, el boyaması dekoratif vazo." },
      { name: "Mini Sukulent Vazosu", price: 120, desc: "Sukulentler için özel tasarlanmış mini seramik vazo." },
      { name: "Çiçek Desenli Vazo", price: 550, desc: "Üzerinde el işi çiçek kabartmaları olan özel vazo." },
      { name: "Mat Siyah Vazo", price: 420, desc: "Mat siyah sırlı, modern çizgilere sahip şık vazo." },
      { name: "Yüksek Boy Dar Vazo", price: 610, desc: "60 cm yüksekliğinde, ince uzun formlu dekoratif vazo." },
      { name: "Çift Kulplu Vazo", price: 720, desc: "Geleneksel çift kulplu, geniş gövdeli seramik vazo." },
    ],
  },
  {
    name: "Tabaklar",
    description: "Sofralarınızı şenlendirecek el yapımı seramik tabaklar.",
    image: img(2, "plate"),
    order: 2,
    products: [
      { name: "El Yapımı Servis Tabak Seti", price: 750, desc: "6 kişilik el yapımı seramik servis tabağı seti, doğal sırlı." },
      { name: "Çini Desenli Yemek Tabağı", price: 280, desc: "Geleneksel Çini motifleriyle süslenmiş yemek tabağı." },
      { name: "Derin Kase", price: 180, desc: "Çorba ve salata servisi için ideal derin seramik kase." },
      { name: "Dekoratif Duvar Tabağı", price: 420, desc: "Duvara asmak için özel tasarlanmış büyük boy tabak." },
      { name: "Tapas Tabak Seti", price: 340, desc: "4'lü tapas tabak seti, farklı renk seçenekleriyle." },
      { name: "Kahvaltı Tabağı Seti", price: 560, desc: "4 kişilik kahvaltı tabağı seti, küçük kaseler dahil." },
      { name: "Balık Tabağı", price: 310, desc: "Uzun oval formlu, özel balık servis tabağı." },
      { name: "Salata Kasesi", price: 220, desc: "Büyük boy seramik salata kasesi, tahta kaşık hediyeli." },
      { name: "Tatlı Tabak Seti", price: 260, desc: "6'lı tatlı tabağı seti, zarif desenli." },
      { name: "Porsiyonluk Kase Seti", price: 190, desc: "8'li küçük porsiyonluk seramik kase seti." },
      { name: "Makarna Tabağı", price: 240, desc: "Derin kenarlı, özel makarna servis tabağı." },
      { name: "Meyve Tabağı", price: 380, desc: "Büyük boy üç ayaklı seramik meyve tabağı." },
    ],
  },
  {
    name: "Bardak & Kupalar",
    description: "Her yudumda el emeğini hissedeceğiniz seramik bardak ve kupalar.",
    image: img(3, "cup"),
    order: 3,
    products: [
      { name: "El Yapımı Seramik Kupa", price: 160, desc: "300 ml kapasiteli, el yapımı seramik kupa." },
      { name: "Kahvaltı Bardak Seti", price: 390, desc: "6'lı kahvaltı bardak seti, doğal sırlı seramik." },
      { name: "Rengarenk Kupa Seti", price: 450, desc: "4 farklı renkte el yapımı kupa seti." },
      { name: "Türk Kahvesi Fincan Seti", price: 320, desc: "6 kişilik geleneksel Türk kahvesi fincan seti." },
      { name: "Dev Boy Kupa", price: 220, desc: "500 ml kapasiteli dev seramik kupa." },
      { name: "Çay Bardağı Seti", price: 280, desc: "6'lı ince belli seramik çay bardağı seti." },
      { name: "Latte Kupa", price: 190, desc: "350 ml kapasiteli, geniş ağızlı latte kupa." },
      { name: "Hediyelik Kupa", price: 140, desc: "Özel baskılı, tekli hediyelik seramik kupa." },
      { name: "Çift Katlı Kupa", price: 250, desc: "Isı yalıtımlı çift katlı seramik seyahat kupası." },
      { name: "Sürahi", price: 340, desc: "1.5 litrelik el yapımı seramik sürahi." },
      { name: "Kahve Fincanı Seti", price: 410, desc: "6 kişilik filtre kahve fincanı seti, tabaklı." },
      { name: "Çocuk Kupa Seti", price: 230, desc: "4'lü çocuklar için özel tasarım kupa seti." },
    ],
  },
  {
    name: "Dekoratif Objeler",
    description: "Ev ve ofis dekorasyonunuzu tamamlayacak özel seramik objeler.",
    image: img(4, "decorative"),
    order: 4,
    products: [
      { name: "Seramik Mumluk", price: 110, desc: "El yapımı seramik mumluk, doğal tonlarda." },
      { name: "Buddha Heykeli", price: 350, desc: "Meditasyon için el yapımı seramik Buddha heykeli." },
      { name: "Seramik Biblo Seti", price: 280, desc: "3 parçalı dekoratif seramik biblo seti." },
      { name: "Anahtarlık", price: 65, desc: "Elde şekillendirilmiş seramik anahtarlık." },
      { name: "Seramik Tablo", price: 580, desc: "Duvara asılabilir büyük boy seramik tablo." },
      { name: "Kuş Figürlü Dekor", price: 160, desc: "El yapımı seramik kuş figürü, dekoratif." },
      { name: "Şamdan Seti", price: 340, desc: "3'lü seramik şamdan seti, farklı boylarda." },
      { name: "Duvar Asma Dekor", price: 210, desc: "Makrome ile birleştirilmiş seramik duvar dekoru." },
      { name: "Kül Tablası", price: 130, desc: "El yapımı seramik kül tablası, desenli." },
      { name: "Mıknatıs Seti", price: 80, desc: "4'lü seramik buzdolabı mıknatısı seti." },
      { name: "Saksı", price: 170, desc: "Orta boy el yapımı seramik saksı, drenaj delikli." },
      { name: "Duvar Çanı", price: 250, desc: "Rüzgarda ses çıkaran el yapımı seramik duvar çanı." },
    ],
  },
  {
    name: "Hediyelik Setler",
    description: "Sevdiklerinize özel hazırlanmış seramik hediye setleri.",
    image: img(5, "gift"),
    order: 5,
    products: [
      { name: "Kahve Keyfi Seti", price: 540, desc: "2 kupa + kahve kutusu içeren hediye seti." },
      { name: "Sofra Seti 24 Parça", price: 2200, desc: "6 kişilik tam sofra seti: tabak, kase, bardak." },
      { name: "Çay Saati Seti", price: 380, desc: "2 çay bardağı + çaydanlık hediye seti." },
      { name: "Yeni Ev Seti", price: 1500, desc: "Yeni evlilere özel: vazo, 4 tabak, 4 kupa." },
      { name: "Sevgili Günü Seti", price: 290, desc: "2 kişilik kalpli desenli kupa seti." },
      { name: "Anneler Günü Seti", price: 350, desc: "Özel tasarım vazo + çiçek desenli tabak." },
      { name: "Kahvaltı Seti", price: 650, desc: "4 kişilik kahvaltı seti: tabak, kase, bardak." },
      { name: "Ofis Seti", price: 280, desc: "Kupa + kalemlik + anahtarlık ofis seti." },
      { name: "Bebek Seti", price: 190, desc: "Bebek için özel seramik kase + kupa + tabak." },
      { name: "Doğum Günü Seti", price: 260, desc: "Kişiye özel isim yazılı kupa + tabak." },
      { name: "Şarap Keyfi Seti", price: 440, desc: "2 şarap kadehi + peynir tabağı seti." },
      { name: "Banyo Seti", price: 370, desc: "Sabunluk + diş fırçalık + bardaktan oluşan set." },
    ],
  },
]

const customers = [
  { name: "Ayşe Yılmaz", email: "ayse@example.com", phone: "0532 111 2233" },
  { name: "Mehmet Demir", email: "mehmet@example.com", phone: "0533 444 5566" },
  { name: "Zeynep Kaya", email: "zeynep@example.com", phone: "0535 777 8899" },
  { name: "Ali Öztürk", email: "ali@example.com", phone: "0536 111 3344" },
  { name: "Elif Koç", email: "elif@example.com", phone: "0537 222 4455" },
  { name: "Can Şahin", email: "can@example.com", phone: "0538 333 5566" },
]

const orderStatuses: Array<"PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED"> = [
  "PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED",
]

const cities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Çanakkale"]
const districts: Record<string, string[]> = {
  İstanbul: ["Kadıköy", "Beşiktaş", "Üsküdar", "Maltepe", "Şişli"],
  Ankara: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut"],
  İzmir: ["Konak", "Karşıyaka", "Bornova", "Buca", "Çiğli"],
  Bursa: ["Osmangazi", "Nilüfer", "Yıldırım", "Gürsu", "Kestel"],
  Antalya: ["Muratpaşa", "Kepez", "Konyaaltı", "Manavgat", "Alanya"],
  Çanakkale: ["Merkez", "Kepez", "Eceabat", "Biga", "Çan"],
}

async function main() {
  console.log("🌱 Seed başlıyor...")

  // Temizlik
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.slider.deleteMany()
  await prisma.event.deleteMany()

  const adminPassword = await hash("admin123", 10)
  await prisma.user.upsert({
    where: { email: "admin@canakci.com" },
    update: {},
    create: { email: "admin@canakci.com", name: "Admin", password: adminPassword, role: "ADMIN" },
  })

  // Kategoriler + ürünler
  for (const cat of categories) {
    const category = await prisma.category.create({
      data: { name: cat.name, slug: slugify(cat.name), description: cat.description, image: cat.image, order: cat.order },
    })

    for (const [i, prod] of cat.products.entries()) {
      const seed = `${slugify(cat.name)}-${slugify(prod.name).slice(0, 20)}`
      await prisma.product.create({
        data: {
          name: prod.name,
          slug: slugify(prod.name),
          description: prod.desc,
          price: prod.price,
          stock: Math.floor(Math.random() * 30) + 5,
          images: [img(cat.order * 100 + i + 1)],
          categoryId: category.id,
          featured: i < 3,
        },
      })
    }
    console.log(`✅ ${cat.name}: ${cat.products.length} ürün`)
  }

  // Slider
  const sliders = [
    { title: "Hoş Geldiniz", subtitle: "Çanakçı Seramik'in eşsiz el yapımı ürünleriyle tanışın", image: imgWide(1), link: "/products", order: 1 },
    { title: "El Yapımı Seramikler", subtitle: "Her parça özenle elde şekillendirilir, binlerce yıllık geleneğin izlerini taşır", image: imgWide(2), link: "/products", order: 2 },
    { title: "Workshop & Etkinlikler", subtitle: "Seramik yapımını öğrenmek ister misiniz? Atölye çalışmalarımıza katılın", image: imgWide(3), link: "/events", order: 3 },
  ]
  for (const sl of sliders) await prisma.slider.create({ data: sl })
  console.log("✅ Slider: 3 eklendi")

  // Etkinlikler
  const events = [
    { title: "Başlangıç Seviye Seramik Atölyesi", slug: "baslangic-seramik-atolyesi", description: "Çömlekçi tornasında kendi bardağınızı yapın.\n\n- Tornaya giriş\n- Temel şekillendirme\n- Sırlama süreci", image: img(101, "workshop"), startDate: new Date("2026-08-15"), time: "14:00", location: "Çanakçı Seramik Atölyesi, Çanakkale", price: 500, capacity: 12 },
    { title: "İleri Seviye Çömlekçi Tornası", slug: "ileri-seviye-torna", description: "Karmaşık formlar (vazo, kase, sürahi) yapmayı öğrenin.\n\n- Merkezleme teknikleri\n- Büyük formlar\n- Kulp yapımı", image: img(102, "workshop"), startDate: new Date("2026-09-05"), time: "10:00", location: "Çanakçı Seramik Atölyesi, Çanakkale", price: 750, capacity: 8 },
  ]
  for (const ev of events) await prisma.event.create({ data: ev })
  console.log("✅ Etkinlik: 2 eklendi")

  // Siparişler (tüm durumlardan)
  const allProducts = await prisma.product.findMany()
  let orderIdx = 1
  for (const status of orderStatuses) {
    for (let i = 0; i < 2; i++) {
      const cust = customers[(orderIdx - 1) % customers.length]
      const city = cities[Math.floor(Math.random() * cities.length)]
      const district = (districts[city] || ["Merkez"])[Math.floor(Math.random() * 5)]
      const itemCount = Math.floor(Math.random() * 3) + 1
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, itemCount)

      const items = shuffled.map((p) => ({
        productId: p.id,
        productName: p.name,
        productImage: p.images[0] || "",
        price: p.price,
        quantity: Math.floor(Math.random() * 3) + 1,
      }))

      const total = items.reduce((s, it) => s + it.price * it.quantity, 0)

      const daysAgo = Math.floor(Math.random() * 30) + 1
      const createdDate = new Date()
      createdDate.setDate(createdDate.getDate() - daysAgo)

      const paymentStatus = status === "CANCELLED" ? "CANCELLED" as const : status === "DELIVERED" ? "PAID" as const : Math.random() > 0.5 ? "PAID" as const : "PENDING" as const

      await prisma.order.create({
        data: {
          orderNumber: `SP-${String(orderIdx).padStart(4, "0")}`,
          customerName: cust.name,
          customerEmail: cust.email,
          customerPhone: cust.phone,
          customerAddress: `${district} Mahallesi, Örnek Sokak No:${Math.floor(Math.random() * 50) + 1}`,
          city,
          district,
          notes: Math.random() > 0.7 ? "Hediye paketi yapılmasını rica ediyorum." : "",
          status,
          paymentMethod: status === "CANCELLED" ? undefined : "Havale/EFT",
          paymentStatus,
          totalAmount: total,
          createdAt: createdDate,
          items: {
            create: items.map((it) => ({
              productId: it.productId,
              productName: it.productName,
              productImage: it.productImage,
              price: it.price,
              quantity: it.quantity,
              subtotal: it.price * it.quantity,
            })),
          },
        },
      })
      orderIdx++
    }
  }
  console.log(`✅ Sipariş: ${orderIdx - 1} adet (6 farklı durum)`)

  // Ayarlar
  const settings = [
    { key: "site_title", value: "Çanakçı Seramik" },
    { key: "site_description", value: "Çanakkale'de el yapımı seramik atölyesi. Özel tasarım vazolar, tabaklar, kupalar ve hediyelik eşyalar." },
    { key: "site_logo", value: "" },
    { key: "hero_title", value: "Çanakçı Seramik" },
    { key: "hero_subtitle", value: "El yapımı seramiklerin sıcaklığını evinize taşıyoruz. Geleneksel Çanakkale seramiği modern dokunuşlarla buluşuyor." },
    { key: "about_title", value: "Hakkımızda" },
    { key: "about_content", value: "Çanakçı Seramik Atölyesi, Çanakkale'nin köklü çömlekçilik geleneğini yaşatmak ve modern tasarımlarla buluşturmak amacıyla kurulmuştur. Atölyemizde her bir ürün, usta ellerde tek tek şekillendirilir, geleneksel yöntemlerle pişirilir ve özenle sırlanır.\n\nSeramik sanatına gönül vermiş ekibimiz, yılların deneyimiyle her parçaya ayrı bir ruh katar. Doğal kilin toprakla buluşmasından ortaya çıkan bu eserler, evinize sıcaklık ve karakter kazandırır.\n\nAtölyemizde ayrıca seramik yapımını öğrenmek isteyenler için workshop ve eğitim programları düzenlenmektedir." },
    { key: "contact_email", value: "info@canakciseramik.com" },
    { key: "contact_phone", value: "+90 286 212 3456" },
    { key: "contact_address", value: "Fevzipaşa Mahallesi, Çömlekçiler Çarşısı No:42, Merkez / Çanakkale" },
    { key: "workingHours", value: "Hafta içi: 09:00 - 18:00, Cumartesi: 10:00 - 16:00" },
    { key: "instagram_url", value: "https://www.instagram.com/canakkaledeseramik/" },
    { key: "instagramEnabled", value: "false" },
    { key: "instagramToken", value: "" },
    { key: "instagramUsername", value: "canakkaledeseramik" },
    { key: "bank_name", value: "Ziraat Bankası" },
    { key: "bank_branch", value: "Çanakkale Şubesi" },
    { key: "bank_account_name", value: "Çanakçı Seramik Atölyesi" },
    { key: "bank_iban", value: "TR12 0001 2345 6789 0123 4567 89" },
    { key: "bank_account_no", value: "1234-567890-1234" },
    { key: "footerText", value: "Çanakçı Seramik - El yapımı seramiklerin sıcaklığını evinize taşıyoruz." },
  ]
  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s })
  }
  console.log("✅ Ayarlar güncellendi")
  console.log("🎉 Seed tamamlandı!")
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
