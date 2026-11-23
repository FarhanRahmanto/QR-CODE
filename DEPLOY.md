# Panduan Deploy Gratis TemuBarang (Vercel + Render + Neon)

Panduan ini membuat website **TemuBarang** bisa diakses publik (**Rp0, tanpa kartu kredit**) langsung dari repository GitHub `FarhanRahmanto/QR-CODE`, cocok untuk demonstrasi tugas kuliah agar QR stiker bisa di-scan langsung dari HP.

Arsitektur:
- **Database PostgreSQL**: [Neon.tech](https://neon.tech) (Free tier, 1 GB, tidak kedaluwarsa)
- **Backend API**: [Render.com](https://render.com) (Free Web Service)
- **Frontend**: [Vercel.com](https://vercel.com) (Hobby Free, sekaligus meneruskan `/api/*` ke Render lewat `vercel.json` agar satu domain)

> **Catatan foto barang:** Foto yang di-upload otomatis dikompres ke WebP (±30–80 KB) dan disimpan di database PostgreSQL (tabel `Photo`), sehingga tidak akan hilang saat server Render restart atau sleep.

---

## Langkah 1 — Buat Database PostgreSQL Gratis di Neon

1. Buka **[neon.tech](https://neon.tech)** dan login menggunakan akun **GitHub**.
2. Klik **Create a project**:
   - **Project name**: `temubarang`
   - **Region**: pilih **AWS Asia Pacific (Singapore) / `ap-southeast-1`** (paling cepat dari Indonesia).
3. Setelah project selesai dibuat, klik tombol **Connect** dan salin **Connection string** (pastikan opsi **Pooled connection** aktif):
   ```text
   postgresql://neondb_owner:xxxx@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Simpan string ini — akan dipakai pada Langkah 2.

---

## Langkah 2 — Deploy Backend di Render (Blueprint)

1. Buka **[dashboard.render.com](https://dashboard.render.com)** dan login dengan **GitHub**.
2. Klik **New +** → **Blueprint** (atau **Web Service**).
3. Hubungkan repository **`FarhanRahmanto/QR-CODE`**.
   - Jika memakai **Blueprint**, Render otomatis membaca file [`render.yaml`](render.yaml) di root repo:
     - Root Directory: `backend`
     - Build Command: `npm install && npm run build:prod`
     - Start Command: `npm run start:prod`
   - Jika membuat **Web Service** manual, masukkan setting di atas, pilih plan **Free**, dan tambahkan Environment Variable `NODE_ENV=production`, `TRUST_PROXY=2`, serta `JWT_SECRET` (klik *Generate*).
4. Isi Environment Variable yang diminta:
   - `DATABASE_URL`: tempel connection string dari Neon (Langkah 1).
   - `FRONTEND_URL`: sementara isi `https://temubarang.vercel.app` (nanti diperbarui setelah Langkah 4).
   - `APP_URL`: sama dengan `FRONTEND_URL`.
5. Klik **Apply / Deploy** dan tunggu hingga status menjadi **Live**.
6. Catat URL backend Render Anda (misalnya `https://temubarang-api.onrender.com`), lalu uji di browser:
   `https://temubarang-api.onrender.com/api/health` → harus muncul `{"status":"ok","database":"ok",...}`.

### (Opsional) Mengisi Akun & Data Demo ke Database Neon
Dari terminal laptop Anda (jalankan sekali saja):
```powershell
cd backend
node scripts/prepare-prod-schema.mjs
$env:DATABASE_URL="TEMPEL_CONNECTION_STRING_NEON_DISINI"
npx prisma db push
npm run seed
# Kembalikan schema lokal ke SQLite setelah selesai:
git checkout prisma/schema.prisma
npx prisma generate
```
Akun demo siap digunakan: `budi.santoso@example.com` / `password123`.

---

## Langkah 3 — Deploy Frontend di Vercel

1. Pastikan URL Render di [`frontend/vercel.json`](frontend/vercel.json) sudah sesuai dengan URL service Render Anda di Langkah 2:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://NAMA-SERVICE-RENDER-ANDA.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   *(Jika URL Render Anda berbeda dari `temubarang-api.onrender.com`, ubah lalu commit & push ke GitHub).*
2. Buka **[vercel.com/new](https://vercel.com/new)** dan login dengan **GitHub**.
3. Import repository **`FarhanRahmanto/QR-CODE`**.
4. Pada bagian **Root Directory**, klik **Edit** → pilih **`frontend`**.
5. Tidak perlu mengisi `VITE_API_URL` jika memakai rewrite di `vercel.json` (frontend memanggil `/api` secara relatif sehingga cookie & CORS berjalan dalam satu domain).
   *(Alternatif: jika tidak memakai rewrite, isi `VITE_API_URL=https://NAMA-SERVICE-RENDER-ANDA.onrender.com/api`).*
6. Klik **Deploy** dan salin domain Vercel Anda (misalnya `https://qr-code-xxxx.vercel.app`).

---

## Langkah 4 — Sinkronkan URL Vercel ke Render

1. Buka kembali dashboard **Render** → service `temubarang-api` → **Environment**.
2. Ubah nilai:
   - `FRONTEND_URL` = `https://qr-code-xxxx.vercel.app` (URL Vercel asli Anda, tanpa `/` di akhir)
   - `APP_URL` = `https://qr-code-xxxx.vercel.app`
3. Klik **Save Changes** (Render akan otomatis redeploy sebentar).
4. Setelah aktif, link QR yang dicetak dari dashboard otomatis mengarah ke `https://qr-code-xxxx.vercel.app/s/{kode}`.

---

## Langkah 5 — Verifikasi Publik & Tips Presentasi Tugas Kuliah

1. Buka `https://qr-code-xxxx.vercel.app/api/health` → pastikan tampil `{"status":"ok","database":"ok"}`.
2. Login dengan email & kata sandi (atau daftar akun baru dengan nomor WhatsApp untuk kontak penemu).
3. Tambah barang beserta foto, unduh/cetak QR code, lalu scan QR dari **HP dengan jaringan seluler** → pastikan halaman `/s/{kode}` tampil dan tombol WhatsApp mengarah ke `wa.me/62...` tanpa membocorkan nomor di halaman publik.
4. **Tips agar Render tidak "tidur" saat demo ke dosen:**
   - Render Free akan *sleep* setelah 15 menit tanpa traffic (akses pertama butuh ±30–60 detik untuk bangun).
   - Buka link website **1–2 menit sebelum presentasi**, atau daftar gratis di **[uptimerobot.com](https://uptimerobot.com)** untuk ping ke `https://qr-code-xxxx.vercel.app/api/health` setiap 10 menit.
