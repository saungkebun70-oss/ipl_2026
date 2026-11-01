import React, { useState } from 'react';
import {
  Shield,
  Download,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Megaphone,
  Plus,
  Clock,
  Database
} from 'lucide-react';
import { FinancialSummary, Transaction, Resident, AuditLog } from '../types';
import { formatRupiah, formatDateIndo, resetDatabase } from '../lib/api';

interface KetuaAdminProps {
  summary: FinancialSummary | null;
  residents: Resident[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  onRefreshData: () => void;
}

export const KetuaAdmin: React.FC<KetuaAdminProps> = ({
  summary,
  residents,
  transactions,
  auditLogs,
  onRefreshData
}) => {
  const [announcements, setAnnouncements] = useState<string[]>([
    '📢 Jadwal Fogging Pencegahan DBD Serentak akan dilaksanakan pada hari Minggu pagi pukul 07.30 WIB di seluruh Blok A s.d Blok E.',
    '🚧 Pemasangan peremajaan kamera CCTV gerbang utama dan portal barcode telah selesai dan beroperasi 24 jam.',
    '🌳 Kerja bakti pemangkasan dahan pohon peneduh jalan utama Saung Kebun dijadwalkan akhir bulan ini.'
  ]);
  const [newNotice, setNewNotice] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.trim()) return;
    setAnnouncements([newNotice.trim(), ...announcements]);
    setNewNotice('');
  };

  const handleResetData = async () => {
    if (!confirm('Apakah Anda yakin ingin me-reset database kembali ke data demo awal? Semua perubahan data baru akan kembali ke default.')) return;
    setIsResetting(true);
    try {
      await resetDatabase();
      onRefreshData();
      alert('Database Saung Kebun berhasil di-reset ke data demo awal.');
    } catch (err: any) {
      alert(err.message || 'Gagal reset');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ketua Executive Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            KT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Panel Pengawasan Ketua Paguyuban
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-xs font-bold">
                SUPERVISI & TRANSPARANSI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Bp. Erlangga (Blok B03/07) · Mengawasi integritas kas, keamanan lingkungan, dan keterbukaan informasi publik bagi 115 warga Saung Kebun.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/db/backup"
            download="backup_saung_kebun.json"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Backup Data JSON (Gratis)</span>
          </a>

          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isResetting ? 'Mereset...' : 'Reset Data Demo'}</span>
          </button>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Kesehatan Finansial Paguyuban</span>
          <div className="text-xl font-extrabold text-emerald-700 font-mono mt-2">
            Surplus Kas (+{summary ? formatRupiah(summary.saldoKasSaatIni) : '...'})
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Cadangan kas mencukupi untuk operasional 6 bulan ke depan tanpa defisit.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Tingkat Kepatuhan Warga</span>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-2">
            {summary?.persentaseKepatuhan || 84}% Patuh
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary?.totalWargaLunas || 97} dari 115 keluarga telah menyelesaikan iuran periode ini.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Tunggakan Tertagih</span>
          <div className="text-xl font-extrabold text-amber-600 font-mono mt-2">
            {summary ? formatRupiah(summary.totalTunggakanWarga) : '...'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Dikelola dengan pendekatan musyawarah kekeluargaan oleh pengurus.
          </p>
        </div>
      </div>

      {/* Maklumat / Bulletin Board Pengumuman Warga */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-bold text-slate-900">
            Papan Maklumat & Pengumuman Resmi Warga
          </h3>
        </div>

        {/* Input Form for Ketua */}
        <form onSubmit={handleAddNotice} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Tulis maklumat atau pengumuman baru untuk seluruh warga Saung Kebun..."
            value={newNotice}
            onChange={(e) => setNewNotice(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan</span>
          </button>
        </form>

        <div className="space-y-2">
          {announcements.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0 mt-1.5" />
              <span className="leading-relaxed flex-1">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Database Security Info */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-emerald-400">Penyimpanan Server Lokal 100% Bebas Biaya</div>
            <div className="text-slate-400 text-[11px]">
              Semua data kas dan PIN warga tersimpan aman pada database lokal aplikasi tanpa ketergantungan API pihak ketiga yang berbayar.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-slate-800 rounded font-mono text-[11px] text-emerald-300">
            ENCRYPTION: AES-256 SIM
          </span>
        </div>
      </div>
    </div>
  );
};
