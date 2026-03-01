

## Rencana: Perbaiki Panduan Remix & Greeting Message

### Masalah
1. `.lovable/plan.md` menyebut "signup via kode" padahal tidak ada form signup di `/pdidin` — hanya login. User baru harus buat akun via chat Lovable (minta AI buatkan) atau lewat backend Auth tab.
2. Greeting message Lovable setelah remix tidak cukup jelas — perlu panduan yang lebih profesional dan actionable langsung di plan.md.

### Yang Akan Dilakukan

**1. Rewrite `.lovable/plan.md` — Panduan profesional & jelas**

Konten baru akan:
- Menjelaskan bahwa **tidak ada form signup** di aplikasi ini — ini by design
- Instruksi pembuatan user: **ketik di chat Lovable**: *"Buatkan akun admin dengan email xxx@xxx.com dan password xxx"* — Lovable AI akan menjalankan SQL yang diperlukan
- Alternatif: buka backend Lovable Cloud → tab Authentication → buat user manual
- Langkah promosi admin via SQL tetap sama tapi dengan penjelasan lebih jelas
- Menyertakan langkah konfigurasi toko
- Format profesional dengan emoji checklist dan bahasa yang ramah untuk pemula

**2. Struktur plan.md baru:**

```text
# 🚀 Selamat Datang! Panduan Setup Setelah Remix

## ✅ Yang Sudah Otomatis (Tidak Perlu Disentuh)
- Database, tabel, RLS policies
- Edge functions (dinamis)
- SPA routing

## 🔐 Langkah 1: Buat Akun Admin
- Ketik di chat Lovable: "Buatkan akun admin dengan email [email] dan password [password]"
- Atau: buka backend → Authentication → Add User

## 👑 Langkah 2: Promosikan ke Admin
- Ketik di chat Lovable: "Jalankan SQL: INSERT INTO public.user_roles..."
- Atau: buka backend → SQL Editor → jalankan query

## 🏪 Langkah 3: Login & Konfigurasi Toko
- Buka /pdidin → login → isi semua pengaturan

## Checklist ringkas (tabel)
```

### File yang Diubah
- `.lovable/plan.md` — rewrite total

### Tidak Ada Perubahan Kode
Tidak ada perubahan di komponen React atau edge functions. Ini murni update dokumentasi.

