

# Membuat Akun Admin

## Langkah-langkah

### 1. Buat Edge Function untuk Registrasi Admin
Membuat backend function sementara yang akan:
- Menerima email dan password
- Membuat akun user baru menggunakan Supabase Admin API (service role key)
- Otomatis menambahkan role `admin` ke tabel `user_roles`

### 2. Panggil Function untuk Membuat Akun
- Email: `didinusmile@gmail.com`
- Password: `@Setyawan15`
- Role: `admin`

### 3. Hapus Edge Function Setelah Selesai
Function ini hanya digunakan sekali untuk setup awal, lalu dihapus demi keamanan.

---

### Detail Teknis

**Edge Function: `create-admin`**
- Menggunakan `SUPABASE_SERVICE_ROLE_KEY` (sudah tersedia di secrets) untuk memanggil `supabase.auth.admin.createUser()`
- Setelah user dibuat, langsung `INSERT INTO user_roles (user_id, role) VALUES (user.id, 'admin')`
- Auto-confirm email agar bisa langsung login tanpa verifikasi

**Setelah berhasil:**
- Anda bisa langsung login di `/pdidin` dengan email dan password di atas
- Edge function akan dihapus agar tidak bisa dipakai orang lain

