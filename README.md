# SIPL Saung Kebun — Sistem Iuran & Pengelolaan Lingkungan Paguyuban Warga

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=typescript)
![Firestore](https://img.shields.io/badge/Cloud_Firestore-Realtime-FFCA28?logo=firebase)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?logo=vercel)

Aplikasi Web Keuangan Paguyuban dan Sistem Pengelolaan Lingkungan terintegrasi untuk **Perumahan Saung Kebun** (141 Kavling: Blok B3, B5, B6, B7, B8, dan Cadangan). Dilengkapi dengan sinkronisasi database Google Cloud Firestore real-time, pencatatan iuran otomatis, dan portal terpisah untuk seluruh peran komunitas.

---

## 🏛️ 4 Portal Terpisah Berdasarkan Peran

### 1. 🏡 Portal Warga (141 Kavling)
- **E-Card Digital IPL**: Kartu keanggotaan digital warga dengan status iuran bulanan dan riwayat pembayaran personal.
- **Bayar Cepat (QRIS & Virtual Account)**: Generator QRIS dinamis dan nomor VA untuk pembayaran iuran Rp 100.000 / bulan.
- **Kwitansi Digital**: Unduh dan cetak bukti setor iuran resmi berstempel paguyuban.
- **Kas Warga & Transparansi**: Keterbukaan alokasi dana satpam, sampah, dan penerangan PJU.
- **Login Mandiri**: Akses instan per kavling dengan Nomor Blok dan PIN default: `1234`.

### 2. 💼 Portal Admin Bendahara Kas
- **Kasir Kas**: Penerimaan setoran tunai atau transfer, verifikasi bukti pembayaran, dan penerbitan kwitansi seketika.
- **Matriks Iuran 141 Kavling**: Tabel grid status setoran bulanan (Februari s/d September) dengan indikator lunas, menunggak (kuning), dan kavling kosong (-).
- **Buku Kas & Pengeluaran**: Pencatatan beban belanja operasional (gaji satpam, biaya kebersihan/sampah, token listrik PJU, perbaikan fasum).
- **Broadcast WhatsApp**: Pengingat tagihan otomatis terkirim langsung ke nomor WA warga yang menunggak.

### 3. 👑 Portal Admin Ketua Paguyuban
- **Supervisi Eksekutif Kas**: Ringkasan saldo kas, tingkat kepatuhan warga, dan monitoring arus kas paguyuban.
- **Maklumat Resmi Warga**: Publikasi berita pengurus, undangan kerja bakti, dan pengumuman lingkungan.
- **Sensus 141 Kavling**: Direktori lengkap identitas pemilik, status hunian tetap/kontrak, tipe rumah hook/standar, dan kontak darurat.
- **Inspeksi Audit Trail**: Verifikasi integritas setiap pencatatan transaksi untuk mencegah kecurangan.

### 4. 🛡️ Portal Petugas Keamanan (Satpam & Pos Jaga)
- **Buku Tamu & Kendaraan Masuk**: Pencatatan tamu berkunjung, kurir/paket, ojek online, dan tukang dengan plat nomor serta kavling tujuan.
- **Check-in / Check-out 1-Klik**: Pantauan real-time jumlah kendaraan tamu yang masih berada di dalam lingkungan.
- **🚨 Panic Button (Sistem Siaga Darurat)**: Tombol sirine darurat untuk Kebakaran, Medis/Ambulans, Pencurian/Maling, dan Bencana.
- **Checklist Ronda Malam**: Monitoring 5 titik vital perumahan dan kontrol lampu PJU.
- **Interkom Digital Kavling**: Cepat hubungi penghuni rumah via WhatsApp untuk konfirmasi tamu asing/kiriman paket.

---

## 🚀 Panduan Publish ke GitHub

Jalankan perintah berikut pada terminal proyek:

```bash
# 1. Tambahkan remote repository GitHub Anda
git remote add origin https://github.com/<USERNAME-ANDA>/sipl-saung-kebun.git

# 2. Pastikan branch utama adalah main
git branch -M main

# 3. Push seluruh kode dan riwayat commit ke GitHub
git push -u origin main
```

---

## ⚡ Panduan Deploy Otomatis ke Vercel

### Metode 1: Import via Dashboard Vercel (Rekomendasi)
1. Buka [https://vercel.com/new](https://vercel.com/new).
2. Login dengan akun GitHub Anda.
3. Pilih repository `sipl-saung-kebun` dan klik **Import**.
4. Pengaturan build otomatis terdeteksi:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik tombol **Deploy** dan aplikasi Anda akan aktif dengan domain `*.vercel.app` dalam ~45 detik!

### Metode 2: Deploy Cepat via Vercel CLI
```bash
# Install dan login Vercel CLI
npm install -g vercel
vercel login

# Deploy ke Production
vercel --prod
```

---

## 🛠️ Menjalankan Proyek Secara Lokal

```bash
# 1. Clone repository
git clone https://github.com/<USERNAME-ANDA>/sipl-saung-kebun.git
cd sipl-saung-kebun

# 2. Install dependensi
npm install

# 3. Jalankan development server
npm run dev
```

Server lokal akan aktif di `http://localhost:3000`.

---

## 📦 Struktur File Penting

- `vercel.json` — Konfigurasi routing rewrite SPA React dan Serverless Function Express di Vercel.
- `api/index.ts` — Serverless handler backend untuk API `/api/summary`, `/api/residents`, `/api/payments/pay`.
- `firebase-applet-config.json` — Konfigurasi koneksi Google Cloud Firestore region `asia-southeast1`.
- `.github/workflows/deploy-vercel.yml` — Automasi pipeline CI/CD GitHub Actions.
- `src/components/KeamananPortal.tsx` — Modul sistem pos jaga, buku tamu, ronda, dan panic alert.
- `src/components/BendaharaAdmin.tsx` — Modul kasir dan pembukuan bendahara.
- `src/components/KetuaAdmin.tsx` — Modul supervisi dan maklumat ketua paguyuban.
- `src/components/WargaPortal.tsx` — Modul E-Card dan pembayaran digital warga.

---

© 2026 Paguyuban Warga Perumahan Saung Kebun. All rights reserved.
