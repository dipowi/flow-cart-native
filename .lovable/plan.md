# 🚀 Selamat Datang! Panduan Setup Setelah Remix

Project ini adalah **toko online siap pakai**. Setelah remix, ikuti 3 langkah di bawah untuk mulai berjualan.

---

## ✅ Yang Sudah Otomatis (Tidak Perlu Disentuh)

| Komponen | Status |
|----------|--------|
| Database (tabel, RLS, fungsi SQL) | ✅ Otomatis via migrasi |
| Edge functions (`ogcard`, `sitemap`, `daily-activity`) | ✅ Dinamis, tidak perlu edit URL |
| SPA routing (`_redirects`) | ✅ Sudah dikonfigurasi |
| Secrets backend (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) | ✅ Otomatis tersedia |

---

## 🔐 Langkah 1: Buat Akun Admin

> ⚠️ **Tidak ada halaman signup di aplikasi ini** — ini memang disengaja (by design). Halaman `/pdidin` hanya untuk login.

**Cara buat akun:**

Ketik perintah ini di chat Lovable:

```
Buatkan akun admin dengan email contoh@email.com dan password passwordku123
```

Lovable AI akan otomatis membuatkan akun untuk kamu.

**Alternatif:** Buka backend Lovable Cloud → tab **Authentication** → klik **Add User** → isi email & password.

---

## 👑 Langkah 2: Promosikan ke Admin

Setelah akun dibuat, kamu perlu menjadikannya admin agar bisa mengakses dashboard `/pdidin`.

Ketik perintah ini di chat Lovable:

```
Jalankan SQL ini: INSERT INTO public.user_roles (user_id, role) VALUES ('<UUID_USER>', 'admin');
```

> 💡 Ganti `<UUID_USER>` dengan UUID akun yang baru dibuat. UUID bisa dilihat di tab Authentication backend.

**Alternatif:** Buka backend Lovable Cloud → **SQL Editor** → jalankan query di atas.

---

## 🏪 Langkah 3: Login & Konfigurasi Toko

1. Buka halaman `/pdidin`
2. Login dengan akun yang sudah dibuat
3. Isi semua pengaturan di **Global Settings**:
   - 🏷️ Nama toko & deskripsi
   - 🖼️ Logo toko
   - 📱 Target checkout (WhatsApp/Telegram/link custom)
   - 🔍 SEO (judul & deskripsi untuk Google)
4. Mulai tambahkan produk!

---

## 📋 Checklist Ringkas

| # | Langkah | Cara |
|---|---------|------|
| 1 | Buat akun | Chat Lovable / Backend Auth tab |
| 2 | Jadikan admin | Chat Lovable / Backend SQL Editor |
| 3 | Konfigurasi toko | Login ke `/pdidin` → Global Settings |

---

## 💡 Tips

- Semua edge function (`ogcard`, `sitemap`) sudah **dinamis** — membaca nama toko & URL dari database secara otomatis
- Edge function `daily-activity` adalah cron maintenance untuk menjaga database tetap aktif
- Tidak perlu edit kode apapun untuk mulai menggunakan toko ini
