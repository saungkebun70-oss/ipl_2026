import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Search,
  Printer,
  Shield,
  CheckCircle,
  Award,
  Phone,
  MessageSquare,
  Activity,
  Layers,
  BarChart3,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { FinancialSummary, Transaction, Resident, OrganizationOfficer } from '../types';
import { formatRupiah, formatDateIndo } from '../lib/api';

const DEFAULT_OFFICERS: OrganizationOfficer[] = [
  {
    jabatan: 'Pembina Paguyuban',
    nama: 'Bp. Iwan',
    blok: 'Blok B08/05',
    roleType: 'PEMBINA',
    tugas: 'Pengarah kebijakan umum, penasehat paguyuban & mediasi warga',
    phone: '081289550805'
  },
  {
    jabatan: 'Ketua Paguyuban',
    nama: 'Bp. Erlangga',
    blok: 'Blok B03/07',
    roleType: 'KETUA',
    tugas: 'Penanggung jawab utama operasional lingkungan, keamanan, ketertiban & fasilitas Saung Kebun',
    phone: '081298765432'
  },
  {
    jabatan: 'Bendahara Kas IPL',
    nama: 'Bp. Andriansyah',
    blok: 'Blok B07/16',
    roleType: 'BENDAHARA',
    tugas: 'Pengelolaan kas iuran bulanan, pembukuan keuangan real-time & verifikasi pembayaran',
    phone: '081287654321'
  },
  {
    jabatan: 'Humas Paguyuban (Koordinator)',
    nama: 'Bp. Doni',
    blok: 'Blok B05/21',
    roleType: 'HUMAS',
    tugas: 'Penyampaian maklumat resmi, komunikasi antar warga & hubungan eksternal perumahan',
    phone: '081234567821'
  },
  {
    jabatan: 'Humas Paguyuban (Anggota)',
    nama: 'Bp. Wahyu',
    blok: 'Blok B05/24',
    roleType: 'HUMAS',
    tugas: 'Sosialisasi kegiatan warga, penampung aspirasi lingkungan & dokumentasi publikasi',
    phone: '081234567824'
  },
  {
    jabatan: 'Seksi Olahraga & Kegiatan',
    nama: 'Bp. Deni',
    blok: 'Blok B08/06',
    roleType: 'SEKSI_OLAHRAGA',
    tugas: 'Pengembangan kegiatan olahraga warga, senam sehat bersama & perawatan lapangan sarana olahraga',
    phone: '081234567806'
  }
];

interface DashboardOverviewProps {
  summary: FinancialSummary | null;
  transactions: Transaction[];
  residents: Resident[];
  officers?: OrganizationOfficer[];
  onOpenReceipt: (tx: Transaction) => void;
  onOpenPayModal: () => void;
  onOpenAddExpense?: () => void;
  isBendaharaOrKetua: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  summary,
  transactions,
  residents,
  officers = DEFAULT_OFFICERS,
  onOpenReceipt,
  onOpenPayModal,
  onOpenAddExpense,
  isBendaharaOrKetua
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'PEMASUKAN' | 'PENGELUARAN'>('ALL');
  const [searchTx, setSearchTx] = useState('');
  const [activePanelFilter, setActivePanelFilter] = useState<'all' | 'charts' | 'officers' | 'blocks' | 'ledger'>('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'ALL' || t.tipe === filterType;
    const matchesSearch =
      t.keterangan.toLowerCase().includes(searchTx.toLowerCase()) ||
      t.kategori.toLowerCase().includes(searchTx.toLowerCase()) ||
      (t.namaWarga && t.namaWarga.toLowerCase().includes(searchTx.toLowerCase())) ||
      (t.blokWarga && t.blokWarga.toLowerCase().includes(searchTx.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Calculate Blok Statistics
  const blokStats = ['A', 'B', 'C', 'D', 'E'].map(group => {
    const groupResidents = residents.filter(r => r.blokGroup === group);
    const paidCount = groupResidents.filter(r => r.statusBulanIni === 'Lunas').length;
    const totalCount = groupResidents.length;
    const percentage = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
    return {
      group,
      totalCount,
      paidCount,
      percentage
    };
  });

  // Historical Monthly Cashflow mock data
  const monthlyTrends = [
    { month: 'Jun', pemasukan: 16500000, pengeluaran: 9800000 },
    { month: 'Jul', pemasukan: 17100000, pengeluaran: 10200000 },
    { month: 'Agt', pemasukan: 16800000, pengeluaran: 9950000 },
    { month: 'Sep', pemasukan: 17400000, pengeluaran: 10500000 },
    { month: 'Okt', pemasukan: summary ? summary.totalPemasukanBulanIni : 18200000, pengeluaran: summary ? summary.totalPengeluaranBulanIni : 10080000 },
  ];

  const maxVal = Math.max(...monthlyTrends.flatMap(m => [m.pemasukan, m.pengeluaran])) * 1.15;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner / Hero Glance */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2.5 border border-emerald-400/20 backdrop-blur-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Transparansi Kas Real-time · Saung Kebun</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            Dashboard Keuangan & Laporan IPL
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Keterbukaan dana iuran warga Perumahan Saung Kebun. Setiap rupiah tercatat real-time dan dialokasikan untuk keamanan 24 jam, kebersihan, dan penerangan 115 unit rumah.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-4 sm:mt-5">
            <button
              onClick={onOpenPayModal}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Bayar Iuran IPL Digital</span>
            </button>

            {isBendaharaOrKetua && onOpenAddExpense && (
              <button
                onClick={onOpenAddExpense}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors cursor-pointer"
              >
                + Catat Belanja Kas
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-white/5 hover:bg-white/15 text-emerald-200 text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* Ambient decorative glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Segmented Intuitive Panel Filter (For quick jumping between sections) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar p-1 bg-slate-200/60 rounded-2xl w-full">
        {[
          { id: 'all', label: 'Semua Panel', icon: Layers },
          { id: 'charts', label: 'Arus Kas & Belanja', icon: BarChart3 },
          { id: 'officers', label: 'Struktur Pengurus', icon: Award },
          { id: 'blocks', label: 'Kepatuhan Blok (115)', icon: Users },
          { id: 'ledger', label: 'Buku Kas Ledger', icon: BookOpen },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activePanelFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePanelFilter(item.id as any)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* KPI Cards Grid (4 Modern Glassmorphism Cards) */}
      {(activePanelFilter === 'all' || activePanelFilter === 'charts') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Saldo Kas */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Total Saldo Kas Berjalan</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {summary ? formatRupiah(summary.saldoKasSaatIni) : '...'}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>Kondisi Kas Surplus & Sehat</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pemasukan Bulan Ini */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Pemasukan Bulan Ini</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {summary ? formatRupiah(summary.totalPemasukanBulanIni) : '...'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Target iuran: <span className="font-mono text-slate-700">{summary ? formatRupiah(summary.targetKasBulanIni) : '...'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Belanja Operasional */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Belanja Operasional</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {summary ? formatRupiah(summary.totalPengeluaranBulanIni) : '...'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Satpam 24 Jam, Truk Sampah, & PJU
              </div>
            </div>
          </div>

          {/* Card 4: Kepatuhan Bayar IPL */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Tingkat Kepatuhan Warga</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {summary ? `${summary.persentaseKepatuhan}%` : '...'}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                <strong className="text-emerald-700 font-semibold">{summary?.totalWargaLunas || 0}</strong> dari {summary?.totalWarga || 115} rumah sudah lunas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Visual Charts (Arus Kas & Alokasi Belanja) */}
      {(activePanelFilter === 'all' || activePanelFilter === 'charts') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart 1: Cashflow Trend (SVG Bar & Comparison) */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tren Arus Kas Bulanan (Pemasukan vs Pengeluaran)
                </h3>
                <p className="text-xs text-slate-500">
                  Data penerimaan iuran dan realisasi belanja operasional bulanan
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                  <span className="text-slate-600 font-medium">Pemasukan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                  <span className="text-slate-600 font-medium">Pengeluaran</span>
                </div>
              </div>
            </div>

            {/* SVG Cash Flow Graphic */}
            <div className="h-56 sm:h-64 w-full flex items-end gap-2 sm:gap-6 pt-4 border-b border-slate-100 pb-2">
              {monthlyTrends.map((item, idx) => {
                const inHeight = Math.max(15, Math.round((item.pemasukan / maxVal) * 100));
                const outHeight = Math.max(15, Math.round((item.pengeluaran / maxVal) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                      {/* In Bar */}
                      <div
                        style={{ height: `${inHeight}%` }}
                        className="w-1/2 max-w-[28px] bg-emerald-600 hover:bg-emerald-700 rounded-t-md transition-all relative flex flex-col justify-start items-center group-hover:shadow-md cursor-pointer"
                      >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap pointer-events-none font-mono z-20">
                          {formatRupiah(item.pemasukan)}
                        </div>
                      </div>

                      {/* Out Bar */}
                      <div
                        style={{ height: `${outHeight}%` }}
                        className="w-1/2 max-w-[28px] bg-rose-500 hover:bg-rose-600 rounded-t-md transition-all relative flex flex-col justify-start items-center group-hover:shadow-md cursor-pointer"
                      >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap pointer-events-none font-mono z-20">
                          {formatRupiah(item.pengeluaran)}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-600 mt-2">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mt-3 pt-2">
              <span>Surplus bulanan stabil: <strong className="text-slate-800 font-mono font-bold">+Rp 7.500.000</strong></span>
              <span>Sinkronisasi otomatis real-time</span>
            </div>
          </div>

          {/* Chart 2: Alokasi Pengeluaran Kas (Progress Breakdown) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Alokasi Belanja Operasional
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Komposisi belanja kas rutin lingkungan
              </p>

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Honor 2 Satpam (24 Jam)</span>
                    <span className="font-mono text-slate-900 font-semibold">43.6% · Rp 4.4jt</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '43.6%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Retribusi Truk Sampah DLH</span>
                    <span className="font-mono text-slate-900 font-semibold">27.8% · Rp 2.8jt</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: '27.8%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Listrik PLN PJU & Pos Kamling</span>
                    <span className="font-mono text-slate-900 font-semibold">14.4% · Rp 1.45jt</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '14.4%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Perawatan CCTV, Taman & Fogging</span>
                    <span className="font-mono text-slate-900 font-semibold">9.2% · Rp 930rb</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '9.2%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Dana Sosial & Santunan Warga</span>
                    <span className="font-mono text-slate-900 font-semibold">5.0% · Rp 500rb</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '5.0%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Dikelola Bendahara (Bp. Andriansyah) dan disetujui Ketua Paguyuban (Bp. Erlangga).</span>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Struktur Kepengurusan Perumahan Saung Kebun */}
      {(activePanelFilter === 'all' || activePanelFilter === 'officers') && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Struktur Kepengurusan Perumahan Saung Kebun
                </h3>
                <p className="text-xs text-slate-500">
                  Dewan pembina, ketua, bendahara, humas, dan seksi olahraga
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200/60 self-start sm:self-auto">
              Periode 2026 - 2029
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {officers.map((off, idx) => {
              const roleColor =
                off.roleType === 'PEMBINA'
                  ? { bg: 'bg-indigo-50/70', border: 'border-indigo-200', badge: 'bg-indigo-600' }
                  : off.roleType === 'KETUA'
                  ? { bg: 'bg-purple-50/70', border: 'border-purple-200', badge: 'bg-purple-600' }
                  : off.roleType === 'BENDAHARA'
                  ? { bg: 'bg-emerald-50/70', border: 'border-emerald-200', badge: 'bg-emerald-600' }
                  : off.roleType === 'SEKSI_OLAHRAGA'
                  ? { bg: 'bg-amber-50/70', border: 'border-amber-200', badge: 'bg-amber-600' }
                  : { bg: 'bg-sky-50/70', border: 'border-sky-200', badge: 'bg-sky-600' };

              const cleanPhone = off.phone ? (off.phone.startsWith('0') ? '62' + off.phone.slice(1) : off.phone) : '';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${roleColor.border} ${roleColor.bg} flex flex-col justify-between transition-all hover:shadow-xs`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider text-white ${roleColor.badge}`}>
                        {off.jabatan}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 bg-white/90 px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                        {off.blok}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {off.nama}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {off.tugas}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-black/5 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      {off.phone || '-'}
                    </span>
                    {off.phone && (
                      <a
                        href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(`Halo ${off.nama} (${off.jabatan} Saung Kebun), perihal informasi perumahan...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-white/90 hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors min-h-[34px]"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat WA</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: Kepatuhan Per Blok */}
      {(activePanelFilter === 'all' || activePanelFilter === 'blocks') && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kepatuhan Iuran Per Blok Hunian (115 Unit)
              </h3>
              <p className="text-xs text-slate-500">
                Tingkat ketertiban pembayaran di Blok A, B, C, D, dan E
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md self-start sm:self-auto">
              Total 115 Rumah Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {blokStats.map(stat => (
              <div key={stat.group} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Blok {stat.group}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    {stat.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>{stat.paidCount} Lunas</span>
                  <span className="text-slate-400">/ {stat.totalCount} Unit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Real-time Buku Kas Umum (Ledger) */}
      {(activePanelFilter === 'all' || activePanelFilter === 'ledger') && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Buku Kas Umum (Real-time Ledger)
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan mutasi kas masuk dan belanja lingkungan
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter pills */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterType === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({transactions.length})
                </button>
                <button
                  onClick={() => setFilterType('PEMASUKAN')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterType === 'PEMASUKAN'
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  onClick={() => setFilterType('PENGELUARAN')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterType === 'PENGELUARAN'
                      ? 'bg-white text-rose-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 sm:flex-initial sm:min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Table View (Desktop & Tablet) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">Kategori & Keterangan</th>
                  <th className="py-3 px-4">Warga / Petugas</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-center">Aksi / Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada transaksi yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.slice(0, 25).map((tx) => {
                    const isIncome = tx.tipe === 'PEMASUKAN';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {formatDateIndo(tx.tanggal)}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                          {tx.nomorTransaksi}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{tx.kategori}</div>
                          <div className="text-slate-500 text-[11px] truncate max-w-xs">{tx.keterangan}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {tx.namaWarga ? (
                            <div>
                              <span className="font-medium text-slate-900">{tx.namaWarga}</span>
                              <span className="text-[11px] text-slate-500 ml-1">({tx.blokWarga})</span>
                            </div>
                          ) : (
                            <span className="text-slate-600">{tx.penanggungJawab}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono">
                            {tx.metodePembayaran || 'Kas Tunai'}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap tabular-nums ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isIncome ? `+${formatRupiah(tx.nominal)}` : `-${formatRupiah(tx.nominal)}`}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {tx.noKwitansi ? (
                            <button
                              onClick={() => onOpenReceipt(tx)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-medium text-[11px] transition-colors cursor-pointer"
                            >
                              e-Kwitansi
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Tercatat</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-Based List (Phone Viewport) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada transaksi yang cocok.
              </div>
            ) : (
              filteredTransactions.slice(0, 15).map((tx) => {
                const isIncome = tx.tipe === 'PEMASUKAN';
                return (
                  <div key={tx.id} className="p-3.5 space-y-2 hover:bg-slate-50/70">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {formatDateIndo(tx.tanggal)} · {tx.nomorTransaksi}
                        </span>
                        <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                          {tx.kategori}
                        </div>
                      </div>
                      <span className={`font-mono font-bold text-xs whitespace-nowrap tabular-nums ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isIncome ? `+${formatRupiah(tx.nominal)}` : `-${formatRupiah(tx.nominal)}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                      <span className="truncate max-w-[180px]">
                        {tx.namaWarga ? `${tx.namaWarga} (${tx.blokWarga})` : tx.penanggungJawab}
                      </span>
                      {tx.noKwitansi ? (
                        <button
                          onClick={() => onOpenReceipt(tx)}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-semibold rounded text-[10px]"
                        >
                          e-Kwitansi
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-mono">{tx.metodePembayaran || 'Tunai'}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Ledger */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>Menampilkan {Math.min(25, filteredTransactions.length)} dari {filteredTransactions.length} mutasi</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersinkronisasi & Terverifikasi
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
