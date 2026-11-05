import React, { useState, useEffect } from 'react';
import {
  Shield,
  Download,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Megaphone,
  Plus,
  Clock,
  Database,
  Building,
  Users,
  TrendingUp,
  FileText,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Activity,
  Globe,
  Radio
} from 'lucide-react';
import { FinancialSummary, Transaction, Resident, AuditLog } from '../types';
import { formatRupiah, formatDateIndo, resetDatabase } from '../lib/api';

interface KetuaAdminProps {
  summary: FinancialSummary | null;
  residents: Resident[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  onRefreshData: () => void;
  onOpenVercelDeploy?: () => void;
}

const DEFAULT_ANNOUNCEMENTS = [
  '📢 Jadwal Fogging Pencegahan DBD Serentak akan dilaksanakan pada hari Minggu pagi pukul 07.30 WIB di seluruh Blok B3 s.d Blok B8.',
  '🚧 Pemasangan peremajaan kamera CCTV gerbang utama dan portal barcode perumahan Saung Kebun telah selesai dan beroperasi 24 jam.',
  '🌳 Kerja bakti pemangkasan dahan pohon peneduh jalan utama Saung Kebun dijadwalkan akhir bulan ini bersama pengurus Humas.',
  '💧 Perawatan berkala pompa air & fasilitas sumur komunal selesai dilaksanakan tanpa kendala.'
];

export const KetuaAdmin: React.FC<KetuaAdminProps> = ({
  summary,
  residents,
  transactions,
  auditLogs,
  onRefreshData,
  onOpenVercelDeploy
}) => {
  const [announcements, setAnnouncements] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saung_kebun_ketua_announcements');
      return saved ? JSON.parse(saved) : DEFAULT_ANNOUNCEMENTS;
    } catch {
      return DEFAULT_ANNOUNCEMENTS;
    }
  });

  const [newNotice, setNewNotice] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'PAYMENT' | 'EXPENSE' | 'ADMIN'>('ALL');

  useEffect(() => {
    try {
      localStorage.setItem('saung_kebun_ketua_announcements', JSON.stringify(announcements));
    } catch (e) {
      console.warn('Failed to save announcements to local storage', e);
    }
  }, [announcements]);

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.trim()) return;
    setAnnouncements([newNotice.trim(), ...announcements]);
    setNewNotice('');
  };

  const handleDeleteNotice = (idx: number) => {
    if (confirm('Hapus maklumat ini?')) {
      setAnnouncements(announcements.filter((_, i) => i !== idx));
    }
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

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditFilter === 'ALL') return true;
    if (auditFilter === 'PAYMENT') return log.action.includes('PEMBAYARAN') || log.action.includes('IPL');
    if (auditFilter === 'EXPENSE') return log.action.includes('PENGELUARAN');
    if (auditFilter === 'ADMIN') return log.role === 'KETUA' || log.role === 'BENDAHARA';
    return true;
  });

  const totalOccupied = residents.filter(r => r.statusHunian !== 'Rumah Kosong').length;
  const totalVacant = residents.length - totalOccupied;

  return (
    <div className="space-y-6">
      {/* Ketua Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl border border-purple-800/40 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-purple-900/30 shrink-0 border border-purple-400/30">
              <ShieldCheck className="w-8 h-8 text-purple-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
                  PANEL EKSEKUTIF KETUA
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SUPERVISI & TRANSPARANSI
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Panel Pengawasan & Kebijakan Ketua Paguyuban
              </h1>
              <p className="text-xs text-purple-200/80 mt-1 max-w-2xl leading-relaxed">
                <strong>Bp. Erlangga (Blok B03/07)</strong> · Mengawasi integritas buku kas, transparansi keuangan, supervisi ketertiban & keamanan lingkungan, serta penerbitan maklumat resmi bagi 141 kavling warga Saung Kebun.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenVercelDeploy && (
              <button
                onClick={onOpenVercelDeploy}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
                title="Status & Otomatisasi Deploy Vercel"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 76 65" fill="none">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                <span>Deploy Vercel</span>
              </button>
            )}

            <a
              href="/api/db/backup"
              download="backup_saung_kebun.json"
              className="px-3.5 py-2.5 bg-purple-900/50 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Download backup data JSON gratis"
            >
              <Download className="w-4 h-4" />
              <span>Backup Data JSON</span>
            </a>

            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="px-3.5 py-2.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Mereset...' : 'Reset Demo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Kas Saat Ini</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {summary ? formatRupiah(summary.saldoKasSaatIni) : '...'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Cadangan kas sehat & siap audit</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Indeks Kepatuhan Warga</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {summary?.persentaseKepatuhan || 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>{summary?.totalWargaLunas || 0} unit lunas dari {residents.length} kavling</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tunggakan Warga</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {summary ? formatRupiah(summary.totalTunggakanWarga) : '...'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Pendekatan kekeluargaan & koordinasi RT
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Status Hunian Kavling</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalOccupied} <span className="text-sm font-normal text-slate-500">Dihuni</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {totalVacant} unit kosong / cadangan
          </p>
        </div>
      </div>

      {/* Maklumat / Bulletin Board Pengumuman Warga */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Papan Maklumat & Pengumuman Resmi Ketua Paguyuban
              </h3>
              <p className="text-xs text-slate-500">
                Maklumat diterbitkan resmi oleh Ketua untuk dibaca seluruh warga Saung Kebun di Portal Warga.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            {announcements.length} Maklumat Aktif
          </span>
        </div>

        {/* Input Form for Ketua */}
        <form onSubmit={handleAddNotice} className="flex gap-2">
          <input
            type="text"
            placeholder="Ketik maklumat baru untuk warga (misal: Rapat Warga, Fogging, Kerja Bakti, Pengamanan Lingkungan)..."
            value={newNotice}
            onChange={(e) => setNewNotice(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Maklumat</span>
          </button>
        </form>

        <div className="space-y-2.5 pt-2">
          {announcements.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-purple-50/40 hover:bg-purple-50/70 border border-purple-100/80 rounded-2xl text-xs text-slate-800 flex items-start justify-between gap-3 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0 mt-1" />
                <span className="leading-relaxed font-medium">{item}</span>
              </div>
              <button
                onClick={() => handleDeleteNotice(idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                title="Hapus maklumat ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log / Transparansi Pengawasan Keuangan */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Log Audit & Pengawasan Eksekutif
              </h3>
              <p className="text-xs text-slate-500">
                Supervisi real-time atas aktivitas pencatatan iuran, mutasi kas, dan perubahan data oleh pengurus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setAuditFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                auditFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setAuditFilter('PAYMENT')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                auditFilter === 'PAYMENT' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Iuran IPL
            </button>
            <button
              onClick={() => setAuditFilter('EXPENSE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                auditFilter === 'EXPENSE' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pengeluaran
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[360px] divide-y divide-slate-100 border border-slate-100 rounded-2xl">
          {filteredAuditLogs.slice(0, 15).map((log) => (
            <div key={log.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">
                    {log.detail}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {log.actor}
                    </span>
                    <span>·</span>
                    <span>{log.action}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                {formatDateIndo(log.timestamp)}
              </span>
            </div>
          ))}

          {filteredAuditLogs.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada catatan log audit pada kategori ini.
            </div>
          )}
        </div>
      </div>

      {/* Database Security Info */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-emerald-400 text-sm">Dual-Persistence Database Real-Time Aktif</div>
            <div className="text-slate-400 text-[11px] mt-0.5 max-w-xl">
              Data kas paguyuban tersinkronisasi dua arah secara real-time ke <strong>Google Cloud Firestore (asia-southeast1)</strong> dan backend server lokal perumahan Saung Kebun.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-400/30 rounded-xl font-mono text-[11px] text-emerald-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            FIRESTORE LIVE
          </span>
        </div>
      </div>
    </div>
  );
};
