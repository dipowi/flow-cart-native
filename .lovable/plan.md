

## Panduan Setup untuk Orang yang Remix Project Ini

Berikut adalah daftar lengkap semua yang perlu dikonfigurasi agar project ini berjalan di Lovable Cloud akun baru.

---

### Langkah 1: Database (Otomatis via Migrasi)

Semua migrasi SQL di folder `supabase/migrations/` akan berjalan otomatis saat project di-remix ke Lovable Cloud baru. Ini mencakup pembuatan:

- **Tabel `products`** — dengan semua kolom (slug, image_urls, is_pinned, order_index, is_active, is_sold_out, cta_text, affiliate_url, dll)
- **Tabel `store_settings`** — konfigurasi global toko (checkout, logo, SEO, dll) + 1 baris default otomatis di-insert
- **Tabel `user_roles`** — RBAC (admin/moderator/user)
- **Tabel `heartbeat`** dan **`supabase_activity`** — untuk maintenance
- **Enum `app_role`** dan fungsi `has_role()` — security definer
- **RLS policies** — semua sudah terdefinisi di migrasi

Tidak ada SQL manual yang perlu dijalankan.

---

### Langkah 2: Buat Akun Admin (WAJIB — Manual)

Ini adalah langkah paling kritis. Tanpa ini, halaman admin `/pdidin` tidak bisa diakses.

1. **Buat user baru** di Authentication Lovable Cloud (atau signup via kode jika ada form signup)
2. **Insert role admin** ke tabel `user_roles` via SQL:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<UUID_USER_DARI_AUTH>', 'admin');
```

Untuk mendapatkan UUID user, jalankan:
```sql
SELECT id, email FROM auth.users;
```

Cara menjalankan SQL ini: buka backend Lovable Cloud, gunakan SQL editor.

---

### Langkah 3: Konfigurasi Toko via Dashboard Admin

Setelah login di `/pdidin`, atur:

- **Tab Pengaturan Global:**
  - Nama Toko & Deskripsi
  - Logo URL (juga jadi favicon & og:image)
  - Posisi Header (kiri/tengah/kanan)
  - Tipe Checkout default (WhatsApp/Telegram/Link) + nomor target
  - SEO Title & Description

- **Tab Manajemen Produk:**
  - Tambah produk baru dengan gambar, harga, slug, tags
  - Atur CTA text & affiliate URL per produk (opsional)
  - Pin, reorder, aktif/nonaktif, sold out

---

### Langkah 4: Update URL di Edge Functions (Opsional tapi Penting)

Dua edge function memiliki URL yang di-hardcode ke `https://soyo.lovable.app`:

- **`supabase/functions/ogcard/index.ts`** — baris 9: `const BASE_URL = "https://soyo.lovable.app"`
- **`supabase/functions/sitemap/index.ts`** — baris 9: `const BASE_URL = "https://soyo.lovable.app"`

Ganti dengan URL published milik akun baru, misalnya `https://namatoko.lovable.app`.

Juga di `ogcard/index.ts` baris 10: `const STORE_NAME = "SOYO STORE"` — ganti sesuai nama toko baru.

---

### Langkah 5: Redirect File (Sudah Ada)

File `public/_redirects` sudah dikonfigurasi untuk SPA routing di Netlify/Lovable. Tidak perlu diubah.

---

### Ringkasan Checklist

| No | Langkah | Otomatis? |
|----|---------|-----------|
| 1 | Database tables, RLS, functions | Ya (migrasi) |
| 2 | Buat user + assign role admin | **Manual (SQL)** |
| 3 | Isi pengaturan toko di `/pdidin` | **Manual (UI)** |
| 4 | Ganti BASE_URL di edge functions | **Manual (kode)** |
| 5 | SPA redirect | Ya (sudah ada) |

---

### Catatan Teknis

- Route admin tersembunyi di `/pdidin` — tidak ada link di storefront
- Login admin menggunakan email + password via authentication system
- Semua secrets backend (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, dll) otomatis tersedia di Lovable Cloud
- Edge function `daily-activity` adalah cron maintenance untuk menjaga database tetap aktif

