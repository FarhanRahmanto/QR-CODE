# Panduan Deploy Gratis TemuBarang (Vercel + Neon — Tanpa Kartu Kredit)

Panduan ini membuat website **TemuBarang** (Frontend + Backend API) tayang publik di **Vercel** dan database PostgreSQL di **Neon**, **100% gratis tanpa kartu kredit**, langsung dari repository GitHub `FarhanRahmanto/QR-CODE`.

Arsitektur:
- **Frontend & Backend API**: [Vercel.com](https://vercel.com) (Hobby Free — Frontend statis dari `frontend/dist` + Backend Express sebagai Serverless Function di `/api`)
- **Database PostgreSQL**: [Neon.tech](https://neon.tech) (Free tier, 1 GB, tidak kedaluwarsa)

> **Catatan foto barang:** Foto yang di-upload otomatis dikompres ke WebP (±30–80 KB) dan disimpan di database PostgreSQL (tabel `Photo`), sehingga foto tetap aman & persisten di serverless Vercel.

---

## Langkah 1 — Buat Database PostgreSQL Gratis di Neon

1. Buka **[console.neon.tech](https://console.neon.tech)** dan login menggunakan akun **GitHub**.
2. Klik **Create a project**:
   - **Project name**: `temubarang`
   - **Region**: pilih **AWS Asia Pacific (Singapore) / `ap-southeast-1`**.
3. Klik **Connect** dan salin **Connection string** (opsi **Pooled connection**):
   ```text
   postgresql://neondb_owner:xxxx@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Buat tabel di Neon sekali dari laptop Anda:
   ```powershell
   cd backend
   node scripts/prepare-prod-schema.mjs
   $env:DATABASE_URL="TEMPEL_CONNECTION_STRING_NEON_DISINI"
   npx prisma db push
   npm run seed
   git checkout prisma/schema.prisma
   npx prisma generate
   ```

---

## Langkah 2 — Deploy Frontend + Backend Sekaligus di Vercel (Tanpa Kartu Kredit)

1. Buka **[vercel.com/new](https://vercel.com/new)** dan login menggunakan akun **GitHub**.
2. Import repository **`FarhanRahmanto/QR-CODE`**.
3. Biarkan **Root Directory** tetap di root repository (`./`) — **JANGAN** diubah ke `frontend`, karena Vercel akan membangun Frontend sekaligus Backend Serverless (`api/index.ts`) menggunakan [`vercel.json`](vercel.json).
4. Buka bagian **Environment Variables** lalu tambahkan **2 variabel** berikut:
   - **`DATABASE_URL`**: tempel connection string Neon PostgreSQL Anda.
   - **`JWT_SECRET`**: isi string acak minimal 32 karakter (misal: `temubarang_jwt_secret_rahasia_panjang_2026_aman`).
5. Klik **Deploy** dan tunggu ±1–2 menit hingga selesai.

---

## Langkah 3 — Verifikasi Publik

Setelah Vercel memberikan domain (misalnya `https://qr-code-xxxx.vercel.app`):
1. Buka `https://qr-code-xxxx.vercel.app/api/health` → pastikan tampil `{"status":"ok","database":"ok",...}`.
2. Buka `https://qr-code-xxxx.vercel.app/login` → coba masuk memakai akun demo `budi.santoso@example.com` / `password123` atau daftar akun baru.
3. Tambah barang dengan foto, unduh/cetak stiker QR, lalu scan dengan **HP (jaringan seluler)** → pastikan halaman `/s/{kode}` terbuka, foto tampil, komentar laporan tersimpan, dan tombol WhatsApp mengarah ke `wa.me/62...` tanpa membocorkan nomor pemilik.
