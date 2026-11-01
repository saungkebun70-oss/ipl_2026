# Panduan Deploy Otomatis ke Vercel — SIPL Saung Kebun

Aplikasi **SIPL Saung Kebun** telah dikonfigurasi penuh dengan file `vercel.json`, endpoint serverless `api/index.ts`, dan GitHub Actions CI/CD `.github/workflows/deploy-vercel.yml`.

---

## METODE 1: Deploy Otomatis via GitHub (Sangat Direkomendasikan)
Metode ini adalah cara termudah dan 100% otomatis. Setiap kali Anda melakukan `git push` ke branch `main` atau `master`, Vercel akan langsung meng-compile dan memperbarui aplikasi secara otomatis.

### Langkah-langkah:
1. **Push Proyek ke Repository GitHub Anda:**
   ```bash
   git add .
   git commit -m "feat: setup vercel deployment"
   git push origin main
   ```
2. **Buka Vercel Dashboard:**
   - Kunjungi [https://vercel.com/new](https://vercel.com/new)
   - Pilih akun GitHub Anda dan klik **"Import"** pada repository proyek SIPL Saung Kebun.
3. **Konfigurasi Project Settings di Vercel:**
   - **Framework Preset**: `Vite` (Otomatis terdeteksi)
   - **Build Command**: `npm run build` (atau `npm run vercel-build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Environment Variables (Opsional jika ingin custom server key):**
   - Tambahkan variabel jika diperlukan:
     - `PORT`: `3000`
     - `MIDTRANS_SERVER_KEY`: `(kunci server Midtrans Anda)`
     - *Catatan*: Koneksi Google Cloud Firestore sudah tersimpan di `firebase-applet-config.json` dan otomatis terbawa saat build.
5. **Klik "Deploy"**:
   - Dalam ~45 detik aplikasi Anda akan langsung aktif dengan domain gratis `*.vercel.app` (contoh: `sipl-saung-kebun.vercel.app`) lengkap dengan HTTPS/SSL gratis.

---

## METODE 2: Deploy Otomatis via GitHub Actions CI/CD
File workflow telah tersedia di `.github/workflows/deploy-vercel.yml`.

### Langkah-langkah:
1. Buat token Vercel di [Vercel Account Settings > Tokens](https://vercel.com/account/tokens).
2. Dapatkan `VERCEL_ORG_ID` dan `VERCEL_PROJECT_ID` dari file `.vercel/project.json` setelah menjalankan `npx vercel link`.
3. Tambahkan 3 secret tersebut ke GitHub Repository Anda di **Settings > Secrets and variables > Actions**:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
4. Setiap kali ada commit masuk ke `main`, GitHub Actions akan otomatis memvalidasi TypeScript (`npm run lint`), build (`npm run build`), dan deploy ke production Vercel.

---

## METODE 3: Deploy Langsung via Vercel CLI (1 Perintah Terminal)
Jika ingin deploy langsung dari terminal komputer Anda:
```bash
# 1. Install Vercel CLI secara global
npm install -g vercel

# 2. Login ke akun Vercel
vercel login

# 3. Deploy langsung ke Production
vercel --prod
```

---

## Struktur File Konfigurasi yang Telah Dibuat:
- **`vercel.json`**: Mengatur URL rewrite untuk SPA React (`/*` -> `/index.html`) agar routing tidak 404 saat di-refresh, serta routing otomatis fungsi serverless `/api/*` ke Express.
- **`api/index.ts`**: Entry point Vercel Serverless Function untuk melayani semua rute backend Express (`/api/summary`, `/api/residents`, `/api/payments/pay`, `/api/webhook/midtrans`).
- **`.github/workflows/deploy-vercel.yml`**: Automasi pipeline CI/CD GitHub Actions.
- **`package.json`**: Ditambahkan script `"vercel-build": "vite build"`.
