

## Analisis Situasi

Pengaturan SEO (meta title, meta description, Open Graph, JSON-LD) saat ini **otomatis diambil** dari field yang sudah ada di tab "Pengaturan Global":
- **Nama Toko** → menjadi `og:title` dan `<title>`
- **Deskripsi Toko** → menjadi `og:description` dan `meta description`
- **URL Logo** → menjadi `og:image`

Jadi secara teknis, SEO sudah terhubung ke dashboard. Yang kurang adalah **visibilitas** — admin tidak tahu bahwa field-field itu juga mengontrol SEO. Tidak ada preview bagaimana tampilan link saat di-share ke WhatsApp/Google.

## Rencana: Tambah "SEO Preview Card" di Dashboard

### 1. Tambah Card "Preview SEO & Sosial Media" di Tab Pengaturan Global

Di bawah card "Tampilan Header" yang sudah ada, kita tambahkan card baru yang menampilkan:

- **Google Search Preview** — Simulasi tampilan di hasil pencarian Google (title biru, URL hijau, description abu-abu)
- **WhatsApp/Social Preview** — Simulasi kartu preview saat link di-share (gambar, judul, deskripsi)
- **Status Checklist** — Indikator centang hijau/merah untuk: Nama Toko terisi, Deskripsi terisi, Logo terisi, Sitemap aktif

Card ini bersifat **read-only preview** — tidak ada field baru. Ia membaca langsung dari state `storeName`, `storeDesc`, dan `logoUrl` yang sudah ada, sehingga preview berubah secara real-time saat admin mengetik.

### 2. Struktur Visual Preview Card

```text
┌─────────────────────────────────────────────┐
│  📊 Preview SEO & Sosial Media              │
│  Begini tampilan toko Anda di Google &      │
│  WhatsApp berdasarkan pengaturan di atas.   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─ Google Search Preview ────────────────┐ │
│  │  Nama Toko — Deskripsi Toko            │ │
│  │  soyo.lovable.app                      │ │
│  │  Deskripsi toko ditampilkan di sini... │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ WhatsApp Preview ────────────────────┐  │
│  │  ┌──────┐  Nama Toko                  │  │
│  │  │ LOGO │  Deskripsi toko...          │  │
│  │  └──────┘  soyo.lovable.app           │  │
│  └────────────────────────────────────────┘  │
│                                             │
│  ✅ Nama Toko    ✅ Deskripsi               │
│  ✅ Logo         ✅ Sitemap Aktif           │
└─────────────────────────────────────────────┘
```

### 3. File yang Diubah

- **`src/pages/Admin.tsx`** — Tambah komponen `SeoPreviewCard` di dalam `GlobalSettingsTab`, tepat setelah card "Tampilan Header". Komponen ini membaca props `storeName`, `storeDesc`, `logoUrl` dari state yang sudah ada.

### Detail Teknis

- Tidak ada perubahan database
- Tidak ada dependency baru
- Preview card menggunakan komponen `Card` dari shadcn/ui yang sudah ada
- Google preview menggunakan styling yang meniru tampilan SERP (font biru untuk title, hijau untuk URL, abu-abu untuk description)
- WhatsApp preview menggunakan rounded card dengan background `bg-muted` yang meniru bubble link WhatsApp
- SEO checklist menggunakan icon `CheckCircle` / `XCircle` dari lucide-react

