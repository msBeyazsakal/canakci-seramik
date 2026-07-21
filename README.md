# Çanakçı Seramik Web Sitesi

Çanakkale'deki seramik atölyesi için web sitesi. Ürün sergileme, etkinlik yönetimi, online sipariş ve admin paneli içerir.

## Teknoloji

- Next.js 14 (App Router)
- Tailwind CSS
- Prisma (PostgreSQL)
- NextAuth.js
- Docker

## Kurulum

```bash
# 1. PostgreSQL'i başlat
npm run db:up

# 2. Veritabanını oluştur ve migrate et
npm run db:migrate

# 3. Seed verilerini yükle (admin kullanıcı + varsayılan ayarlar)
npm run db:seed

# 4. Geliştirme sunucusunu başlat
npm run dev
```

## Varsayılan Admin Hesabı

- **E-posta:** admin@canakci.com
- **Şifre:** admin123

## Scriptler

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run db:up` | PostgreSQL'i Docker ile başlat |
| `npm run db:migrate` | Prisma migration çalıştır |
| `npm run db:seed` | Seed verilerini yükle |
| `npm run db:studio` | Prisma Studio'yu aç |
| `npm run db:setup` | Tüm DB kurulumunu tek komutta yap |

## Site Haritası

### Public Sayfalar
- `/` - Ana Sayfa
- `/products` - Ürünler
- `/products/[slug]` - Ürün Detay
- `/events` - Etkinlikler
- `/events/[slug]` - Etkinlik Detay
- `/news` - Medya
- `/about` - Hakkımızda
- `/contact` - İletişim
- `/cart` - Sepet
- `/checkout` - Ödeme
- `/order/[orderNumber]` - Sipariş Onay

### Müşteri Paneli
- `/panel` - Dashboard
- `/panel/orders` - Siparişlerim
- `/panel/events` - Etkinlik Kayıtlarım
- `/panel/profile` - Profil

### Admin Paneli
- `/admin` - Dashboard
- `/admin/products` - Ürün Yönetimi
- `/admin/categories` - Kategori Yönetimi
- `/admin/sliders` - Slider Yönetimi
- `/admin/events` - Etkinlik Yönetimi
- `/admin/event-registrations` - Katılımlar
- `/admin/orders` - Siparişler
- `/admin/news` - Medya Yönetimi
- `/admin/messages` - Mesajlar
- `/admin/settings` - Site Ayarları
- `/admin/users` - Kullanıcı Yönetimi

## Ödeme

Şu an için **Havale/EFT** ile ödeme alınmaktadır. Müşteri sipariş oluşturduktan sonra admin panelde görünen banka hesap bilgilerine havale yapar, admin siparişi onaylar. Gelecekte İyzico entegrasyonu eklenebilir.
